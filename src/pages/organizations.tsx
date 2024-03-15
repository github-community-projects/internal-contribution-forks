import { ChevronRightIcon } from '@primer/octicons-react'
import { ActionList, Avatar, Box, Octicon } from '@primer/react'
import { personalOctokit } from 'bot/octokit'
import { getAuthServerSideProps } from 'components/auth-guard'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'

interface OrganizationsProps {}

const Organizations: FC<OrganizationsProps> = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<
    Awaited<ReturnType<typeof getAllOrganizations>>
  >([])

  // fetch all the organizations a user is in via octokit
  const getAllOrganizations = async (accessToken: string) => {
    const octokit = personalOctokit(accessToken)
    const data = await octokit.rest.orgs.listForAuthenticatedUser()
    return data.data
  }

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!session?.user) {
      // redirect to homepage
      router.replace('/')
    }
  }, [session, router, session?.user, status])

  useEffect(() => {
    // TODO: Make this type work
    const { accessToken } = (session?.user as any) ?? {}
    if (!accessToken) {
      return
    }

    getAllOrganizations(accessToken)
      .then((orgs) => {
        setOrganizations(orgs)
      })
      .catch((err) => {
        console.error(err)

        // If there's an auth error, sign the user out and redirect them to the homepage
        if (err.message === 'Bad credentials') {
          signOut()
        }
      })
  }, [session])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <h1>Organizations</h1>
      <Box>
        <ActionList showDividers>
          {organizations.map((organization) => (
            <ActionList.LinkItem
              key={organization.id}
              href={`/orgs/${organization.id}`}
            >
              <ActionList.LeadingVisual>
                <Avatar src={organization.avatar_url} />
              </ActionList.LeadingVisual>
              <Box>
                {organization.login} {organization.description}
              </Box>
              <ActionList.TrailingVisual>
                <Octicon icon={ChevronRightIcon} />
              </ActionList.TrailingVisual>
            </ActionList.LinkItem>
          ))}
        </ActionList>
      </Box>
    </Box>
  )
}

export default Organizations

export const getServerSideProps = getAuthServerSideProps
