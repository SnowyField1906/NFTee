import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { getAuctionInfo } from "./utils/ReadonlyContracts";

import { pagesList, findPublicGateWay } from "./utils/constants";

import Header from "./containers/Navigators/Header";
import * as Pages from "./pages";

import Collection from "./containers/Collection/components/Collection";
import Profile from "./pages/External/Profile";



function App() {
	const allPagesList = [pagesList.Special, ...pagesList.Main, ...pagesList.Sub];
	const [claimNFT, setClaimNFT] = useState('');
	const [bid, setBid] = useState(0);
	const [account, setAccount] = useState({
		address: '',
		privateKey: '',
		wallet: null,
	});


	const pageTag = (i) => {
		const Tag = Pages[allPagesList[i]];
		return <Tag account={account} setAccount={setAccount} />;
	};

	const externalProfile = (address) => {
		return <Profile address={address} setAccount={setAccount} />;
	}

	const externalCollection = (collection) => {
		return <Collection address={collection} setAccount={setAccount} />;
	}

	console.log(bid)

	return (
		<div className="h-screen main-overflow">
			{
				claimNFT && <div className="fixed top-0 left-0 w-screen h-screen z-[100] grid justify-center items-center backdrop-lg select-none">
					<div className="w-[60vw] h-[30vh] bg- bg-cover bg-center overflow-hidde rounded-xl justify-self-center"
						style={{
							backgroundImage: `url(${findPublicGateWay(claimNFT)})`,
						}}>
					</div>

					<div className="w-full h-full flex flex-col justify-center items-center">
						<p className="text-huge">You have won the auction!</p>
						<p className="text-huge mt-2">Please claim your NFT</p>
						<button className="button-medium text-black dark:text-white text-xl py-4 px-6 font-semibold mt-5 rounded-lg" >Claim</button>
					</div>
				</div>
			}
			<Router>
				<Header account={account} setAccount={setAccount} />
				<Routes>
					{allPagesList.map((_, i) => {
						return (
							<Route path={"NFTee/" + (i ? allPagesList[i].toLowerCase() : '')} element={pageTag(i)} />
						);
					})}
				</Routes>
			</Router>
			<div class="fixed h-14 w-14 flex left-8 bottom-8 ml-[-0.5rem] z-20 rounded-full backdrop-blur-sm bg-white/50 dark:bg-black/50">
			</div>
		</div >
	);
}

export default App;