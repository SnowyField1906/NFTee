import { useState } from "react";
import axios from "axios";

import { findPublicGateWay } from "../../utils/constants";
import { createNFT } from "../../utils/contracts";

function Create({ account }) {
  const [createNFTParams, setCreateNFTParams] = useState({
    _user: account.address,
    _price: 0,
    _onSale: false,
    _visibility: false,
    _ipfs: "QmUQU3oEhdXBJrNp8QCi7eyJMEg3LAUSBzjiDXbMUSius9",
  });

  console.log(createNFTParams);

  const [status, setStatus] = useState();

  const uploadImage = (e) => {
    setStatus('Uploading...')
    sendFileToIPFS(e, e.target.files[0]);
  }

  const sendFileToIPFS = async (e, fileImg) => {
    setStatus("Starting...");
    e.preventDefault();
    setStatus("Checking file...")
    if (fileImg) {
      try {
        setStatus("Uploading file to IPFS...")
        const formData = new FormData();
        formData.append("file", fileImg);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
            'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`,
            "Content-Type": "multipart/form-data"
          },
        });

        console.log(resFile.data.IpfsHash);

        setCreateNFTParams({ ...createNFTParams, _ipfs: resFile.data.IpfsHash });

        setStatus("Finding gateway...")

        setStatus(findPublicGateWay(resFile.data.IpfsHash))

      } catch (error) {
        setStatus("Error uploading file to IPFS");
      }
    }
  }


  console.log(createNFTParams);


  return (
    <div className="page-bg h-screen">
      <div className="grid grid-cols-2 grid-rows-1 w-screen h-full select-none" >
        <div className="grid self-center justify-self-center place-items-center w-[30vw] h-[30vw] transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-500 hover:scale-105 focus:outline-none">
          <label className="grid w-full h-full justify-self-center">
            {!status ?
              <>
                <span className="flex self-center justify-self-center items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-medium text-gray-600">
                    Drop files to attach, or&nbsp;
                    <span className="text-blue-600 underline">browse</span>
                  </span>
                </span>
                <input type="file" name="file_upload" className="w-full h-full hidden" onChange={(e) => uploadImage(e)} required />

              </>
              : status.slice(0, 5) !== "https" ?
                <p className="text-center self-center">
                  {status}
                </p>
                :
                <div
                  className="relative w-full h-full bg- bg-cover bg-center overflow-hidden rounded-lg"
                  style={{
                    backgroundImage: `url(${status})`,
                  }}>
                </div>
            }
          </label>
        </div>

        <div className="grid self-center w-[40vw] h-[30vw] ">
          <div className="grid overflow-hidden grid-cols-5 grid-rows-4 gap-2">

            <p className="text-high text-left place-self-center">Price:</p>
            <input className="col-start-2 col-end-6 place-self-center w-4/5 h-14 px-4 transition bg-white border-2 border-gray-300 rounded-md appearance-none cursor-pointer hover:border-gray-500 focus:outline-none"
              type="number" placeholder="Price"
              onChange={(e) => setCreateNFTParams({ ...createNFTParams, _price: +e.target.value })} />

            <p className="text-high text-left place-self-center">Visibility:</p>

            <div className="col-start-2 col-end-4 flex place-self-center place-items-center w-2/3 h-20 ml-14"
              onChange={(e) => setCreateNFTParams({ ...createNFTParams, _visibility: e.target.value === 'true' })} >
              <input type="radio" id="visibility-true" name="visibility" class="hidden peer" value={true} required checked={createNFTParams._visibility} />
              <label for="visibility-true" class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-green-500 peer-checked:border-green-600 peer-checked:text-green-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                <div class="block">
                  <div class="w-full text-lg font-semibold">Yes</div>
                  <div class="w-full">Make this NFT public</div>
                </div>
              </label>
            </div>

            <div className="col-start-4 col-end-6 flex place-self-center place-items-center w-2/3 h-20 mr-14"
              onChange={(e) => setCreateNFTParams({ ...createNFTParams, _visibility: e.target.value === 'true', _onSale: e.target.value === 'true' })} >
              <input type="radio" id="visibility-false" name="visibility" class="hidden peer" value={false} required checked={!createNFTParams._visibility} />
              <label for="visibility-false" class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-red-500 peer-checked:border-red-600 peer-checked:text-red-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                <div class="block">
                  <div class="w-full text-lg font-semibold">No</div>
                  <div class="w-full">Make this NFT private</div>
                </div>
              </label>
            </div>


            <p className="text-high text-left place-self-center">On sale:</p>

            <div className="col-start-2 col-end-4 flex place-self-center place-items-center w-2/3 h-20 ml-14"
              onChange={(e) => setCreateNFTParams({ ...createNFTParams, _onSale: e.target.value === 'true' })} >
              <input type="radio" id="onsale-true" name="onsale" className="hidden peer" value={true} required checked={createNFTParams._onSale}
                disabled={!createNFTParams._visibility}
              />
              <label for="onsale-true" className="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-green-500 peer-checked:border-green-600 peer-checked:text-green-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                <div className="block">
                  <div className="w-full text-lg font-semibold">Yes</div>
                  <div className="w-full">Sell this NFT</div>
                </div>
              </label>
            </div>

            <div className="col-start-4 col-end-6 flex place-self-center place-items-center w-2/3 h-20 mr-14"
              onChange={(e) => setCreateNFTParams({ ...createNFTParams, _onSale: e.target.value === 'true' })} >
              <input type="radio" id="onsale-false" name="onsale" class="hidden peer" value={false} required checked={!createNFTParams._onSale} />
              <label for="onsale-false" class="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-red-500 peer-checked:border-red-600 peer-checked:text-red-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                <div class="block">
                  <div class="w-full text-lg font-semibold">No</div>
                  <div class="w-full">Just exhibit this NFT</div>
                </div>
              </label>
            </div>
            <button className="col-start-2 col-end-5 place-self-center place-items-center  w-full h-12 text-white bg-blue-500 rounded-md hover:bg-blue-600 text-xl font-semibold"
              onClick={() => createNFT(createNFTParams)}>Create</button>

          </div>


        </div>
      </div>
    </div>
  );
}

export default Create;