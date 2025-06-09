import React from 'react'
import { UserData } from '../../context/UserContext';


export default function AddPublication() {
  const { user } = UserData();
  return (
    <div>AddPublication
      <div>
      <h1 className="text-center capitalize text-3xl mt-20 font-bold">welcome {user.name}</h1>
    </div>
    </div>
  )
}
