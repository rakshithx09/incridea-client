import Navbar from "@/src/components/navbar";
import { useAuth } from "@/src/hooks/useAuth";
import { bodyFont, titleFont } from "@/src/utils/fonts";
import { events } from "@/src/utils/events";
import Event from "@/src/components/event";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Menu } from "@headlessui/react";
import { PublishedEventsDocument, PublishedEventsQuery } from "@/src/generated/generated";
import Image from "next/image";
import { client } from "@/src/lib/apollo";
import SearchBox from "@/src/components/searchbox";
import { AiOutlineSearch } from "react-icons/ai";

const Events: NextPage<{ data: PublishedEventsQuery["publishedEvents"] }> = ({
  data,
}) => {
  const filters = [
    "ALL",
    "CORE",
    "CSE",
    "ISE",
    "AI/ML",
    "CC",
    "ECE",
    "EEE",
    "MECH",
    "CIVIL",
    "ROBOTICS",
  ];
  const { status, user } = useAuth();
  const [currentFilter, setCurrentFilter] = useState<typeof filters[number]>("ALL");
  const [query, setQuery] = useState("");

  const [filteredEvents, setFilteredEvents] = useState(data || []);
  
  const handleFilter = (filter: typeof filters[number]) => {
    setQuery("");
    setCurrentFilter(filter);
    if (filter === "ALL") {
      setFilteredEvents(data || []);
    } else {
      setFilteredEvents(data.filter((event) => event.branch.name === filter));
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentFilter("ALL");
    if (e.target.value === "") {
      setFilteredEvents(data || []);
    } else {
      setFilteredEvents(
        data.filter((event) => event.name.toLowerCase().includes(e.target.value.toLowerCase()))
      );
    }
  };

  return (
    <div className="bg-gradient-to-b  from-[#41acc9]  via-[#075985] to-[#2d6aa6] min-h-screen relative">
      <Navbar status={status} user={user} />
      <Image
        src="/assets/png/waterflare.png"
        height={1000}
        width={1000}
        alt="flare"
        className="absolute max-h-screen pointer-events-none opacity-50  top-0 right-0"
      />
      <h1
        className={`${titleFont.className} font-bold text-5xl tracking-wide text-center pt-32 text-white`}>
        EVENTS
      </h1>
      <div className="flex items-center gap-2 md:mx-10 mx-4 justify-between lg:flex-col lg:mx-auto mt-4">
        <div className="relative lg:w-[800px] w-full">
          <input
            value={query}
            onChange={handleSearch}
            className="w-full pr-14 bg-black/30 placeholder:text-gray-200/70 focus:outline-none text-white rounded-sm  pl-3 p-2"
            placeholder="Search away!"
            type="text"
          />
          <AiOutlineSearch
            size={"1.4rem"}
            className="absolute right-3 top-2.5 text-gray-300/70"
          />
        </div>
        <div className="lg:flex lg:w-[800px] justify-between gap-3 mt-4 mx-auto  hidden eventNavigation font-semibold">
          {filters.map((filter) => (
            <span
              key={filter}
              className={`${
                filter === currentFilter ? "bg-black/20" : "hover:bg-black/10"
              } text-white cursor-pointer rounded-sm px-3 py-1`}
              onClick={() => handleFilter(filter)}>
              {filter}
            </span>
          ))}
        </div>
        <div className="lg:hidden flex justify-center my-2 py-2 rounded-md">
          <Menu as={"div"} className={"relative inline-block"}>
            <Menu.Button
              className={
                "inline-flex bg-white/90 w-full justify-center rounded-full px-4 py-2 text-sm font-medium text-black"
              }>
              Filters
            </Menu.Button>
            <Menu.Items className="overflow-hidden pb-1.5 bg-white absolute z-[1] text-center right-0  top-0 rounded-md shadow-lg">
              {filters.map((filter) => (
                <Menu.Item key={filter}>
                  {({ active }) => (
                    <button
                      className={`${
                        currentFilter === filter ? "bg-red-300" : "bg-white"
                      } text-black rounded-sm m-1.5 mb-0 w-32 px-3 py-2 text-sm`}
                      onClick={() => handleFilter(filter)}>
                      {filter}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
        </div>
      </div>
      {currentFilter !== "ALL" && filteredEvents.length > 0 && (
        <div className="md:hidden flex mb-3 justify-center">
          <span className="text-gray-200  text-xs">
            Displaying {filteredEvents.length} {currentFilter} event(s)
          </span>
        </div>
      )}
      <div className="md:p-10 md:pt-10 pt-1 p-4 flex justify-center ">
        {filteredEvents.length === 0 ? (
          <div className="flex italic items-center justify-center min-h-[20rem] text-xl w-screen text-center text-gray-200/70">
            <span>no events found</span>
          </div>
        ) : (
          <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvents.map((event) => (
              <Event data={event} key={event.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const { data: events } = await client.query({
    query: PublishedEventsDocument,
    fetchPolicy: "no-cache",
  });

  return {
    props: {
      data: events.publishedEvents,
    },
    revalidate: 60,
  };
}

export default Events;
