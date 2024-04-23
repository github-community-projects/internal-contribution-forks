import LoginBox from 'components/login'
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

  return <LoginBox />
}

export default HomePage
