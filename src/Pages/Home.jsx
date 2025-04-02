import React from 'react';
import Navbar from '../Components/Navbar';

function Home() {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <h1 className="text-3xl font-bold">Welcome to the Home Page!</h1>
      </main>
    </>
  );
}

export default Home;
