import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Input,
  Stack,
  Button,
  useBoolean,
  SimpleGrid,
  UnorderedList,
  ListItem,
  Divider,
} from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { customTheme } from "./utils/theme";

export const App = () => {

  //API Configuration
  const apiKey = "";
  const apiUrl = "https://api.happi.dev/"

  //States
  const [searchValue, setSearchValue] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [artistResult, setArtistResult] = useState<any[]>([]);
  const [lyricCounter, setLyricCounter] = useState(0);
  const [meanAverageLyrics, setMean] = useState<number>();
  const [isLoadingResults, setIsLoading] = useBoolean();

  useEffect(() => {
    const timeOutRef = setTimeout(() => {
      setSearchValue(searchInput);
    }, 500);
    return () => clearTimeout(timeOutRef);
  }, [searchInput]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    setIsLoading.toggle();

    //Reset states to their default as counts etc will change. TODO: move this out to a function
    setArtistResult([]);
    setLyricCounter(0);
    setMean(0);

    fetch(`${apiUrl}v1/music?q=${encodeURIComponent(searchValue)}&apikey=${apiKey}&lyrics=1&limit=50`)
      .then((response) => response.json())
      .then((response) => setArtistResult(response.result));

      //TODO: Make search intuitive and verify results

    setIsLoading.toggle();
  };

  let getAndCountLyrics = async function (lyricUrl: string): Promise<string> {
    let lyrics = "";
    await fetch(lyricUrl + `?apikey=${apiKey}`)
      .then((response) => response.json())
      .then((response) => { lyrics = response.result.lyrics; countLyrics(response.result.lyrics)} )
    return lyrics;
  }

  //Once we have some search results, trigger a count of and store lyrics in the array
  useEffect(() => {
    artistResult && artistResult.map((artist) => { 
      let lyrics = "";
      getAndCountLyrics(artist.api_lyrics)
      .then((result) => artist.song_lyrics = result)
    });
  }, [artistResult]);

  let countLyrics = function (lyrics: string): number {
    let count = 0;
    lyrics = lyrics.replace(/(^\s*)|(\s*$)/gi,"");//exclude any start and end white-space
    lyrics = lyrics.replace(/[ ]{2,}/gi," ");//Tidy up spacing e.g 2 or more space to 1
    lyrics = lyrics.replace(/\n /,"\n"); //Exclude newlines
    count = lyrics.split(' ').filter(function(str){return str!=="";}).length;
    setLyricCounter(lyricCounter => lyricCounter + count);
    return count;
  }

  useEffect(() => {
    setMean(lyricCounter / artistResult.length);
  }, [lyricCounter]);

  return (
    <ChakraProvider theme={customTheme}>
      <Box bg="brand.background" height="100%" minHeight="800px">
        <Stack
          as={Box}
          textAlign={'center'}
          spacing={{ base: 3, md: 7 }}
          py={{ base: 10, md: 18 }}
          padding='100px'>
          <Text as={'span'} fontWeight={600} fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }} backgroundImage="linear-gradient(45deg,#73ef37,#00edff)" backgroundClip="text">
            Looking at Lyrics
          </Text>
          <Text color={'brand.text'}>
            Ever been curious about how many lyrics a song contains? Are you a huge fan of statistics? You've come to the right place!
          </Text>
          <Input variant='filled' type="text" onChange={(event) => setSearchInput(event.target.value)} value={searchInput} placeholder='Enter your favourite artist to get started...' maxW="400px" alignSelf="center" _focus={{bg: 'white'}} focusBorderColor='pink.400'>
          </Input>
          <Button minW="150px" isLoading={isLoadingResults} colorScheme='pink' alignSelf='center' onClick={handleSearchSubmit}>Submit</Button>
          <Divider />
          {/* TODO, tidy up stats. Store the data somewhere and map over an array instead? */}
          <SimpleGrid columns={{ base: 1, md: 3 }} visibility={artistResult.length > 0 ? "visible" : "hidden"}>
                <Box>
                  <Text
                    fontFamily={'heading'}
                    fontSize={'3xl'}
                    color={'white'}
                    mb={3}>
                    Average Lyrics
                  </Text>
                  <Text fontSize={'xl'} color={'gray.400'}>
                    {meanAverageLyrics}
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontFamily={'heading'}
                    fontSize={'3xl'}
                    color={'white'}
                    mb={3}>
                    Based on
                  </Text>
                  <Text fontSize={'xl'} color={'gray.400'}>
                    {artistResult.length} different songs
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontFamily={'heading'}
                    fontSize={'3xl'}
                    color={'white'}
                    mb={3}>
                    Titles Include
                  </Text>
                  <UnorderedList>
                    {artistResult && artistResult.slice(0, 6).map((result) => { return <ListItem color={'gray.400'}>{result.track}</ListItem> })}
                  </UnorderedList>
                </Box>
          </SimpleGrid>
        </Stack>
      </Box>
    </ChakraProvider>
  );

};

export default App;
