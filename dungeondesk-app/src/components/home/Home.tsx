



const Home = () => {
  return (
    <>
        <div className="bg-gray-800 text-white p-10">
            <img src="/path/to/hero-image.jpg" alt="D&D Hero Image" className="w-full object-cover h-96" />
            <h1 className="text-4xl mt-4">Welcome to Our D&D App</h1>
            <p className="mt-4">Experience the best of tabletop gaming in a digital format.</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600">Get Started</button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <img src="/path/to/feature-icon1.png" alt="Feature 1" className="w-16 h-16 mx-auto" />
                <h2 className="text-2xl mt-4">Feature 1</h2>
                <p>Short description about this feature.</p>
            </div>
        </div>

        <div className="bg-gray-100 p-10">
            <h2 className="text-3xl mb-6">What Users Are Saying</h2>
            <div className="space-y-6">
                <div>
                    <p>"This app is amazing! Really changed how we play D&D."</p>
                    <p>- User A</p>
                </div>
            </div>
        </div>

        <footer className="bg-gray-800 text-white p-10 mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-xl mb-4">About Us</h3>
                    <p>Short description about your company or team.</p>
                </div>
            </div>
        </footer>

    </>
  )
}
export default Home