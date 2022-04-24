import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
} from '@chakra-ui/react'
import { FaLocationArrow, FaTimes } from 'react-icons/fa'
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { useRef, useState } from 'react'

const center = { lat: 52.5149509, lng: 13.4536875 }

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [middleman, setMiddleMan] = useState('')
  const middleManList = ["Storkower Str. 219, 10367 Berlin, Germany", "Rigistraße 8, 12277 Berlin, Germany"]
  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const middlemanRef = useRef()
  if (!isLoaded) {
    return <SkeletonText />
  }

  async function calculateRoute() {
    if (originRef.current.value === '' || destiantionRef.current.value === '') {
      return
    }
    let maxDistance = 9999999
    let mm = 0
    for (let i in middleManList) {
          // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destiantionRef.current.value,
        waypoints: [{location: middleManList[i],
          stopover: true}],
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
  
      })
      let durationValue =   results.routes[0].legs[0].duration.value + results.routes[0].legs[1].duration.value
      if (durationValue < maxDistance) {
        mm = i
        maxDistance = durationValue
        
    }
      }
  
      // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const endResults = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,
      waypoints: [{location: middleManList[mm],
        stopover: true}],
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
        setDirectionsResponse(endResults)
        console.log(endResults)
        setDistance(((endResults.routes[0].legs[0].distance.value + endResults.routes[0].legs[1].distance.value) / 1000).toFixed(1)   + " km")
        setDuration(((endResults.routes[0].legs[0].duration.value + endResults.routes[0].legs[1].duration.value)/60).toFixed(0) + " Minutes ")
        setMiddleMan(endResults.routes[0].legs[0].end_address)
  }

  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destiantionRef.current.value = ''
    middlemanRef.current.value = ''
  }

  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      h='100vh'
      w='100vw'
    >
      <Box position='absolute' left={0} top={0} h='100%' w='100%'>
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius='lg'
        m={4}
        bgColor='white'
        shadow='base'
        minW='container.md'
        zIndex='1'
      >
        <HStack spacing={2} justifyContent='space-between'>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input type='text' placeholder='Origin' ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type='text'
                placeholder='Destination'
                ref={destiantionRef}
              />
            </Autocomplete>
          </Box>

          <ButtonGroup>
            <Button colorScheme='gray' type='submit' onClick={calculateRoute}>
              Calculate Route
            </Button>
            <IconButton
              aria-label='center back'
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent='space-between'>
          <Text>Distance: {distance} (By Driving)</Text>
          <Text>Duration: {duration} </Text>
          <Text>Middleman: {middleman} </Text>
          <IconButton
            aria-label='center back'
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.panTo(center)
              map.setZoom(15)
            }}
          />
        </HStack>
      </Box>
    </Flex>
  )
}

export default App
