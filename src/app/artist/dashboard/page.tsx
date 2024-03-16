"use client";

import React from "react";
import { CreateSongForm } from "~/components/create-song-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// export const Sidebar = ({ handleOptionSelect }: { handleOptionSelect: (option: string) => void }) => {
//   const [activeTab, setActiveTab] = useState('uploaded-tunes');

//   const handleOptionClick = (option: string) => {
//     setActiveTab(option);
//     handleOptionSelect(option);
//   };

//   return (
//     <div className="flex flex gap-3">
//       <Button variant="outline" className={`p-2 w-full ${activeTab === 'uploaded-tunes' && `bg-neutral-800`}`}
//         onClick={() => handleOptionClick('uploaded-tunes')}
//       >Dashboard</Button>
//       {/* <a href="#" onClick={() => handleOptionSelect("uploaded-tunes")} className="block p-4 hover:bg-accent hover:text-accent-foreground">
//               My Tunes
//             </a> */}
//       <Button variant="outline" className={`p-2 w-full ${activeTab === 'upload-new-tune' && `bg-neutral-800`}`}
//         onClick={() => handleOptionClick('upload-new-tune')}
//       >Upload New Tune</Button>

//       {/* <a href="#" onClick={() => handleOptionSelect("upload-new-tune")} className="block p-4 hover:bg-accent hover:text-accent-foreground">
//               Upload New Tune
//             </a> */}
//     </div>
//   );
// };

export const Dashboard = () => {
  // const [selectedOption, setSelectedOption] = useState('uploaded-tunes');

  // const handleOptionSelect = (option: string) => {
  //   setSelectedOption(option);
  // };

  return (
    <>
      <h1 className="mb-2 mt-7 p-3 text-center text-4xl font-extrabold tracking-tight">
        Artist Dashboard
      </h1>
      <div className="">
        <Tabs defaultValue="dash" className="">
          <div className="flex justify-center">
            <TabsList className="">
              <TabsTrigger value="dash">Uploaded Tunes</TabsTrigger>
              <TabsTrigger value="upload">Create new Tune</TabsTrigger>
            </TabsList>
          </div>
          <div className="px-6">
            <TabsContent value="dash">
              <UploadedTunesContent />
            </TabsContent>
            <TabsContent value="upload">
              <CreateSongForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

const UploadedTunesContent = () => {
  // Logic for displaying uploaded tunes content
  return <div>Uploaded Tunes Content</div>;
};

const UploadNewTuneContent = () => {
  // Logic for displaying upload new tune content
  return <div>Upload New Tune</div>;
};

export default Dashboard;
