import { LoginForm } from '@/components/auth/LoginForm'
import { Card } from '@/components/ui/card'

export const metadata = {
    title: 'ورود | آبفارین',
}

type SearchParams = Promise<{ redirect?: string }>

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams

    return (
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
            <Card className="w-full max-w-md p-6">
                <h1 className="mb-1 text-2xl font-bold">ورود</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    به حساب کاربری خود وارد شوید
                </p>
                <LoginForm redirectTo={params.redirect} />
            </Card>
        </div>
    )
}