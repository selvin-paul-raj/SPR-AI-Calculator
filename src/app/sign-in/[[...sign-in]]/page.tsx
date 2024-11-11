import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='w-full h-screen flex  justify-center items-center flex-col  gap-4'>
        <h1 className='md:text-2xl text-xl'>Welcome Guys🖖  </h1>
        <SignIn />
    </div>
  )
}