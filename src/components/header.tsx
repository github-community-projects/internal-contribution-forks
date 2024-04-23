import { MarkGithubIcon } from '@primer/octicons-react'
import { Avatar, Box, Button, Header, Octicon, Text } from '@primer/react'
import { signOut, useSession } from 'next-auth/react'

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function MainHeader() {
  const { data: session } = useSession()

  return (
    <Header
      sx={{
        backgroundColor: 'pageHeaderBg',
        borderBottom: '1px solid',
        borderColor: 'border.default',
      }}
    >
      <Header.Item>
        <Octicon icon={MarkGithubIcon} color="fg.default" size={32}></Octicon>
      </Header.Item>
      <Header.Item full>
        <Text sx={{ color: 'fg.default', fontSize: '2', fontWeight: 'bold' }}>
          Internal Contribution Forks
        </Text>
      </Header.Item>
      {session && (
        <Box>
          {session.user && (
            <Header.Item sx={{ mr: 0 }}>
              <Box sx={{ paddingRight: '20px' }}>
                <Button
                  onClick={() => {
                    signOut()
                  }}
                >
                  Sign out
                </Button>
              </Box>
              <Box>
                {session.user.image && (
                  <Avatar src={session.user.image} size={32}></Avatar>
                )}
              </Box>
            </Header.Item>
          )}
        </Box>
      )}
    </Header>
  )
}
