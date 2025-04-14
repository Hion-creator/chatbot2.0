import React from 'react'

function AccountToggle() {
    const empresa = localStorage.getItem("empresa") || "Empresa";

    return (
        <div className='border-b mb-4 mt-2 pb-4 border-stone-300'>
            <button className='flex p-0.5 hover:bg-stone-200 rounded 
        transition-colors relative gap-2 w-full items-center'>
                <img
                    src="https://api.dicebear.com/9.x/notionists/svg"
                    alt="avatar"
                    className='size-8 rounded shrink-0 bg-violet-500'
                />
                <div className='text-start'>
                    <span className='text-sm font-semibold block'>
                        {empresa}
                    </span>
                </div>
            </button>
        </div>
    )
}

export default AccountToggle