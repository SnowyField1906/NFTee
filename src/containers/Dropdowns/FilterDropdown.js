import { useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'

function FilterDropdown(props) {
    const [filter, setFilter] = useState("")

    useEffect(() => {
        props.setFilter(...props.filter, filter)
    }, [filter])

    const isActive = () => {
        return props.array.includes(filter)
    }
    return (
        <div className="flex items-center justify-center p-12">
            <div className="relative inline-block text-left">
                <Menu>
                    {({ open }) => (
                        <>
                            <span className="rounded-md shadow-sm">
                                <Menu.Button className={`${isActive() ? "text-black dark:text-white" : "text-black/50 dark:text-white/50"} inline-flex justify-center w-[11rem] h-12 px-4 py-2 pt-3 text-md font-semibold leading-5 transition duration-150 ease-in-out button-medium rounded-md focus:outline-none focus:shadow-outline-blue border`}>
                                    <span>{isActive() ? filter : props.name}</span>
                                    <svg
                                        className="w-5 h-5 ml-2 -mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Menu.Button>
                            </span>

                            <Transition
                                show={open}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items
                                    static
                                    className="absolute right-0 w-[11rem] mt-2 origin-top-right button-medium-no-hover divide-black/50 dark:divide-white/50 rounded-md shadow-lg outline-none"
                                >
                                    <div className="py-1">
                                        <Menu.Item>
                                            <button
                                                onClick={() => setFilter("")}
                                                className={`${filter === ""
                                                    ? 'bg-black/50 text-white text-semibold'
                                                    : 'text-black/50 dark:text-white/50'
                                                    } hover:bg-black/50 hover:text-white flex rounded-md items-center w-full px-2 py-2 text-md`}
                                            >
                                                All
                                            </button>
                                        </Menu.Item>
                                    </div>
                                    <div className="py-1">
                                        {
                                            props.array.map((item, index) => (
                                                <Menu.Item key={index}>
                                                    <button
                                                        onClick={() => setFilter(item)}
                                                        className={`${item === filter
                                                            ? 'bg-black/50 text-white text-semibold'
                                                            : 'text-black/50 dark:text-white/50'
                                                            } hover:bg-black/50 hover:text-white flex rounded-md items-center w-full px-2 py-2 text-md`}
                                                    >
                                                        {item}
                                                    </button>
                                                </Menu.Item>
                                            ))
                                        }
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </>
                    )}
                </Menu>
            </div>
        </div>
    )
}

export default FilterDropdown
