import { useState, useEffect } from 'react'
import { SlNotebook } from 'react-icons/sl'
import { LiaUserPlusSolid } from 'react-icons/lia'
import { GiArmorPunch } from 'react-icons/gi'
import { useLayoutContext } from '../../contexts/LayoutContext'
import logo from '../../assets/images/dungeonlogo2.png'


const testimonials = [
    {
        text: "This app is amazing! Really changed how we play D&D.",
        author: "Christian A."
    },
    {
        text: "I've never experienced D&D like this before. Totally game-changing!",
        author: "Dizzly K."
    },
    {
        text: "A seamless blend of the traditional with the digital. Highly recommended!",
        author: "Thieves-126"
    }
];


const Home = () => {
    const { drawerOpen } = useLayoutContext();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
        }, 3000); // Change every 5 seconds
    
        return () => clearInterval(interval);
    }, []);
    

    return (
        <div>
            {/* Hero Section */}
            <section className={`bg-[#0c0a26] text-white p-10 shadow-lg ${drawerOpen ? '' : 'mt-[400px]'}`}>
                <div className="container mx-auto">
                    <img
                        src={logo}
                        alt="D&D Hero Image"
                        className="w-full object-cover h-96 rounded-lg"
                    />
                    <h1 className="text-5xl italic mt-6 font-base">It's Dangerous to Go Alone..</h1>
                    <p className="mt-4 text-xl">Experience tabletop gaming and collaboration in a digital format.</p>
                    <button className="mt-6 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-all duration-300">
                        Get Started
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-slate-200 py-10">
                <div className="container mx-auto">
                    <h3 className="text-4xl mb-8 font-semibold text-center">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="transition-all hover:shadow-lg hover:bg-indigo-200 p-4 rounded-lg">
                            <SlNotebook className="text-4xl text-indigo-800 mx-auto" />
                            <h3 className="text-3xl mt-4 font-medium text-center">Centralized Campaign Management</h3>
                            <p className="mt-2 text-xl italic text-center">Track your progress together</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="transition-all hover:shadow-lg hover:bg-indigo-200 p-4 rounded-lg">
                            <LiaUserPlusSolid className="text-4xl text-indigo-800 mx-auto" />
                            <h2 className="text-3xl mt-4 font-medium text-center">Character Sheets</h2>
                            <p className="mt-2 text-xl italic text-center">Let us handle the calculations</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="transition-all hover:shadow-lg hover:bg-indigo-200 p-4 rounded-lg">
                            <GiArmorPunch className="text-4xl text-indigo-800 mx-auto" />
                            <h2 className="text-3xl mt-4 font-medium text-center">Items, Spells, and Equipment</h2>
                            <p className="mt-2 text-xl italic text-center">Stay tuned!!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-[#0c0a26] text-white py-10">
                <div className="container mx-auto">
                    <h2 className="text-4xl mb-8 font-base text-center">What Users Are Saying</h2>
                    <div className="space-y-6">
                    <div className="bg-white shadow-lg p-6 rounded-lg">
                        <p className="text-xl text-black font-medium leading-relaxed">
                            "{testimonials[currentTestimonial].text}"
                        </p>
                        <p className="mt-4 text-gray-600">- {testimonials[currentTestimonial].author}</p>
                    </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-[#0c0a26] text-white py-10">
                <div className="container mx-auto flex flex-col items-center">
                    {/* About Us Section */}
                    <div className="mb-8 w-full md:w-1/3">
                        <h3 className="text-2xl mb-6 font-semibold text-center">About Us</h3>
                        <p className="text-lg text-center">
                            Issues? Concerns? Suggestions?
                        <p>
                            <a href="mailto:admin@dungeondesk.com">Email Us</a>
                        </p>
                        </p>
                    </div>

                    {/* Copyright Section */}
                    <div className="text-center border-t border-white pt-4">
                        &copy; {new Date().getFullYear()} DungeonDesk. All rights reserved.
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;
