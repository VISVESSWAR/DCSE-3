import React, { createContext } from 'react'

const ModalContext=createContext();
export default function Modal({children}) {
  return (
    <div className='flex justify-center items-center w-[50%] h-[80%] backdrop-blur-sm'>
        {children}
    </div>
  )
}

function Body()
{
    return <></>
}
function Window()
{
    return <></>
}

Modal.Body=Body;
Modal.Window=Window;


