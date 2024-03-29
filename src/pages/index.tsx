import { Box } from '@primer/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      // redirect to organizations page
      router.replace('/organizations')
    }
  }, [session, router, session?.user])

  return (
    <Box>
      <Box>Welcome to Internal Contribution Forks, sign in to get started</Box>
    </Box>
  )
}

export default HomePage
