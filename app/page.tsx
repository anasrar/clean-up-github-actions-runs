"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Endpoints } from "@octokit/types"
import { Loader2, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import useSWRMutation from "swr/mutation"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z.string().min(1),
  repository: z.string().min(1),
  token: z.string().min(5),
})

async function sendRequest(
  _key: string,
  { arg }: { arg: z.infer<typeof formSchema> }
) {
  const data = await fetch(
    `https://api.github.com/repos/${arg.username}/${arg.repository}/actions/runs?per_page=100`,
    {
      method: "GET",
      headers: {
        Authorization: `token ${arg.token}`,
      },
    }
  ).then(
    (res) =>
      res.json() as Promise<
        Endpoints["GET /repos/{owner}/{repo}/actions/runs"]["response"]["data"]
      >
  )

  for (const workflow of data.workflow_runs) {
    await fetch(
      `https://api.github.com/repos/${arg.username}/${arg.repository}/actions/runs/${workflow.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${arg.token}`,
        },
      }
    )
  }

  return data.workflow_runs.length
}

export default function IndexPage() {
  const { trigger, isMutating } = useSWRMutation("/api/runs", sendRequest)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(arg: z.infer<typeof formSchema>) {
    trigger(arg)
  }

  return (
    <>
      <section className="flex max-w-lg flex-col gap-8 px-6 py-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-row justify-center">
              <h1 className="text-center text-2xl font-extrabold leading-tight tracking-tighter">
                Clean Up <br /> GitHub Actions Runs
              </h1>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repository"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository</FormLabel>
                      <FormControl>
                        <Input placeholder="repository" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <FormControl>
                      <Input
                        type={"password"}
                        placeholder="ghp_*** or github_pat_***"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Personal access tokens with scope repo and workflow for
                      classic token or actions read and write for fine-grained
                      token.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-row justify-center">
              <Button size={"sm"} type={"submit"} disabled={isMutating}>
                {isMutating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}{" "}
                Remove Runs
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </>
  )
}
