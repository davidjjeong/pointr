import { ThemeSwitcherBtn } from '@/components/ThemeSwitcherBtn';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
import CreateTransactionDialog from './_components/CreateTransactionDialog';

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if(!userSettings){
    redirect("/wizard");
  }

  return (
    <div className="flex flex-col px-20 py-10">
      <div className="flex flex-row-reverse justify-between items-center">
        <div className="flex gap-x-6">
          <ThemeSwitcherBtn />
          <UserButton />
        </div>
      </div>
      <h1 className="text-3xl">Hello, {user.firstName}</h1>
      <div className="w-5 mt-5">
        <CreateTransactionDialog trigger={
          <Button className="rounded-2xl">
            + Expense
          </Button>
        } />
      </div>
    </div>
  )
}

export default page
