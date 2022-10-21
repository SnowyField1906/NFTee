/*
 * Copyright 2022 Convexus Protocol
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.score.Galleries;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Set;
import score.Address;
import score.Context;
import score.annotation.EventLog;
import score.annotation.External;
import score.annotation.Payable;
import scorex.util.ArrayList;
import scorex.util.Base64;
import scorex.util.HashMap;

public class Galleries {
  public HashMap<Address, ArrayList<String>> userMapCollections = new HashMap<>();
  public HashMap<String, ArrayList<String>> collectionMapNFTs = new HashMap<>();
  public HashMap<String, ArrayList<Address>> nftMapRequests = new HashMap<>();

  public HashMap<String, Collection> collectionInfo = new HashMap<>();
  public HashMap<String, NFT> nftInfo = new HashMap<>();
  public HashMap<String, Auction> auctionInfo = new HashMap<>();

  private String decodeTransactionHash(String _hash) {
    byte[] decode = Base64.getDecoder().decode(Context.getTransactionHash());
    return new String(decode, StandardCharsets.UTF_8);
  }

  private String generateCollectionId(Address _user, String _name) {
    return _user.toString() + "/" + _name.replace(" ", "-");
  }

  @External(readonly = true)
  public ArrayList<String> getUserCollections(Address _user) {
    return this.userMapCollections.get(_user);
  }

  @External(readonly = true)
  public ArrayList<String> getCollectionNFTs(String _collection) {
    ArrayList<String> nfts = this.collectionMapNFTs.get(_collection);
    for (String nft : nfts) {
      if (
        !this.nftInfo.containsKey(nft) ||
        (
          !this.nftInfo.get(nft).visibility &&
          !this.nftInfo.get(nft)
            .owner.equals(_collection.substring(0, _collection.indexOf("/")))
        )
      ) {
        nfts.remove(nft);
      }
    }
    return nfts;
  }

  @External(readonly = true)
  public ArrayList<Address> getNFTRequests(String _nft) {
    return this.nftMapRequests.get(_nft);
  }

  @External(readonly = true)
  public ArrayList<String> getCollectionInfo(String _collection) {
    Collection collection = this.collectionInfo.get(_collection);
    return new ArrayList<>(
      List.of(
        collection.name,
        collection.description,
        String.valueOf(collection.visibility)
      )
    );
  }

  @External(readonly = true)
  public ArrayList<String> getNFTInfo(String _nft) {
    NFT nft = this.nftInfo.get(_nft);
    return new ArrayList<>(
      List.of(
        nft.owner.toString(),
        nft.price.toString(),
        String.valueOf(nft.visibility),
        String.valueOf(nft.onSale)
      )
    );
  }

  @External(readonly = true)
  public ArrayList<String> getAuctionInfo(String _auction) {
    Auction auction = this.auctionInfo.get(_auction);
    return new ArrayList<>(
      List.of(
        auction.timestamp.toString(),
        auction.duration.toString(),
        auction.bid.toString(),
        auction.bidder.toString(),
      )
    );
  }

  @External(readonly = true)
  public boolean auctionExists(String _auction) {
    return this.auctionInfo.containsKey(_auction);
  }

  @External
  public void createCollection(
    Address _user,
    String _name,
    String _description,
    boolean _visibility
  ) {
    Collection newCollection = new Collection(_name, _description, _visibility);
    ArrayList<String> collections = this.userMapCollections.get(_user);
    if (collections == null) {
      collections = new ArrayList<String>();
    }
    String collection = this.generateCollectionId(_user, _name);
    collections.add(collection);
    this.userMapCollections.put(_user, collections);
    this.collectionMapNFTs.put(collection, new ArrayList<String>());

    this.collectionInfo.put(collection, newCollection);
  }

  @External
  public void deleteCollection(Address _user, String _collection) {
    ArrayList<String> collections = this.userMapCollections.get(_user);
    if (collections == null) {
      return;
    }
    collections.remove(_collection);
    this.userMapCollections.put(_user, collections);
    this.collectionInfo.remove(_collection);
  }

  @External
  public void toggleCollectionVisibility(String _collection) {
    Collection collection = this.collectionInfo.get(_collection);
    collection.visibility ^= true;
    this.collectionInfo.put(_collection, collection);
  }

  @External
  public void createNFT(
    Address _user,
    BigInteger _price,
    boolean _visibility,
    boolean _onSale,
    String _ipfs
  ) {
    NFT nft = new NFT(_user, _price, _visibility, _onSale);
    String collection = this.generateCollectionId(_user, "owning");
    if (!this.collectionInfo.containsKey(collection)) {
      this.createCollection(_user, "owning", "NFTs owned by this user", true);
    }
    ArrayList<String> nfts = this.collectionMapNFTs.get(collection);
    nfts.add(_ipfs);
    this.nftInfo.put(_ipfs, nft);

    this.collectionMapNFTs.put(collection, nfts);
    this.nftMapRequests.put(_ipfs, new ArrayList<Address>());
  }

  @External
  public void addToCart(Address _user, String _nft) {
    String collection = this.generateCollectionId(_user, "cart");
    if (!this.collectionInfo.containsKey(collection)) {
      this.createCollection(_user, "cart", "Your cart", true);
    }
    ArrayList<String> nfts = this.collectionMapNFTs.get(collection);
    nfts.add(_nft);
    this.collectionMapNFTs.put(collection, nfts);
  }

  @External
  public void addNFT(String _nft, String _collection) {
    ArrayList<String> nfts = this.collectionMapNFTs.get(_collection);
    nfts.add(_nft);
    this.collectionMapNFTs.put(_collection, nfts);
  }

  @External
  public void removeNFT(String _nft, String _collection) {
    ArrayList<String> nfts = this.collectionMapNFTs.get(_collection);
    nfts.remove(_nft);
    this.collectionMapNFTs.put(_collection, nfts);
  }

  @External
  public void deleteNFT(Address _user, String _nft) {
    String collection = this.generateCollectionId(_user, "owning");
    ArrayList<String> nfts = this.collectionMapNFTs.get(collection);
    nfts.remove(_nft);
    this.collectionMapNFTs.put(collection, nfts);
    this.nftInfo.remove(_nft);
  }

  @External
  public void toggleNFTVisibility(
    String _nft,
    boolean _visibility,
    boolean _onSale
  ) {
    NFT nft = this.nftInfo.get(_nft);
    nft.visibility ^= _visibility;
    nft.onSale ^= _onSale;
    this.nftInfo.put(_nft, nft);
  }

  @External
  public void sendRequest(Address _user, String _nft) {
    ArrayList<Address> requests = this.nftMapRequests.get(_nft);
    requests.add(_user);
    this.nftMapRequests.put(_nft, requests);
    if (requests.size() == 0) {
      Auction auction = new Auction(Context.getBlockTimestamp(), 0, _user);
      this.auctionInfo.put(_nft, auction);
    }
  }

  @External(readonly = true)
  public boolean duringAuction(String _nft, BigInteger _timestamp) {
    return this.auctionInfo(_nft).timestamp.add(86400) <= _timestamp && _timestamp <= this.auctionInfo(_nft).timestamp.add(86400).add(this.auctionInfo(_nft).duration);
  }

  @External
  @Payable
  public void bid(Address _user, String _nft, BigInteger _bid) {
    Auction auction = this.auctionInfo.get(_nft);
    auction.bid = _bid;
    auction.bidder = _user;
    this.auctionInfo.put(_nft, auction);

    NFT nft = this.nftInfo.get(_nft);
    nft.owner = _user;
    nft.price = nft.price.add(_bid);
    this.nftInfo.put(_nft, nft);
  }

  @External(readonly = true)
  public ArrayList<Address> users() {
    Map<Address, ArrayList<String>> map = this.userMapCollections;
    ArrayList<Address> users = new ArrayList<Address>();
    for (Address user : map.keySet()) {
      users.add(user);
    }
    return users;
  }
  // @External(readonly = true)
  // public ArrayList<String> collections() {
  //   Map<String, ArrayList<String>> map = this.collectionMapNFTs;
  //   ArrayList<String> collections = new ArrayList<String>();
  //   map.forEach(
  //     (k, v) -> {
  //       collections.add(k);
  //     }
  //   );
  //   return collections;
  // }
}
