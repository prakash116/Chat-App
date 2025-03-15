import React from 'react'

function AuthImagePattern({tittle, subtitle}) {
  return (
    <>
      <div className='hidden lg:flex items-center justify-center bg-base-200 p-12'>
        <div className='max-w-md text-center'>
            <div className='grid grid-cols-3 mb-8'>
                {[...Array(9)].map((_, i) => (
                     <div key={i}
                     className={`aspect-square m-1 rounded-2xl bg-primary/10 ${ i % 2 === 0 ? "animate-pulse" : ""}`}></div>
                ))}
            </div>
            <h2>{tittle}</h2>
            <p>{subtitle}</p>
        </div>
      </div>
    </>
  )
}

export default AuthImagePattern
