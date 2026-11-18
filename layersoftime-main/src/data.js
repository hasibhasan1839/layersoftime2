// All site content lives here. Titles, descriptions and contact details are
// placeholders — edit them to match the real work.

export const site = {
  name: 'Layers of Time',
  tagline: 'Architecture, drawing & photography',
  email: 'layers.time28@gmail.com',
  phone: '+880 1688 483030',
  location: 'Dhaka, Bangladesh',
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hasan-shariar-844610169' },
  ],
}

const proj = (file) => `/images/projects/${file}`

export const projects = [
  {
    slug: 'brick-and-sage-residence',
    title: 'Brick & Sage Residence',
    typology: 'Residential',
    storeys: 'G + 4',
    status: 'Design proposal',
    summary:
      'A compact urban home where a solid brick spine anchors light, sage-toned floor plates and deep balconies.',
    description: [
      'The building is organised around a single exposed-brick core that carries the stair and services. Everything else is lighter: white slab edges, sage infill walls and full-height glazing that opens onto generous balconies.',
      'A slatted pergola caps the roof terrace, filtering the afternoon sun and giving the top floor an outdoor room. The final view explores an alternative façade in terracotta and timber with planting on every level.',
    ],
    images: [proj('brick-sage-1.jpg'), proj('brick-sage-2.jpg'), proj('brick-sage-3.jpg'), proj('brick-sage-4.jpg')],
  },
  {
    slug: 'oculus-house',
    title: 'Oculus House',
    typology: 'Residential',
    storeys: 'G + 4',
    status: 'Design proposal',
    summary:
      'A brick tower pierced by a circular opening frames the sky and gives the street façade its identity.',
    description: [
      'A vertical brick plane runs the full height of the front elevation and is cut at the top by a perfect circle — a window to the sky from the roof terrace and a quiet landmark from the street.',
      'Either side, stacked balconies carry hanging planters, softening the façade over time as the greenery grows in. Timber-finish shutters and a raised planted plinth bring warmth and privacy to the ground floor.',
    ],
    images: [proj('oculus-1.jpg'), proj('oculus-2.jpg'), proj('oculus-3.jpg'), proj('oculus-4.jpg')],
  },
  {
    slug: 'green-terrace-apartments',
    title: 'Green Terrace Apartments',
    typology: 'Multi-family housing',
    storeys: 'G + 7',
    status: 'Design proposal',
    summary:
      'A mid-rise apartment block where brick-clad bays and planted balconies break down a long street frontage.',
    description: [
      'The long elevation is divided into a rhythm of white frames and recessed brick bays. Each bay carries its own column of planted balconies, so the building reads as a series of vertical gardens rather than a single mass.',
      'At street level a landscaped forecourt and screened parking keep the ground plane open and walkable.',
    ],
    images: [proj('terrace-1.jpg'), proj('terrace-2.jpg'), proj('terrace-3.jpg')],
  },
  {
    slug: 'lakeside-retreat',
    title: 'Lakeside Retreat',
    typology: 'Private residence',
    storeys: 'G + 1',
    status: 'Concept',
    summary: 'Stacked stone volumes cantilever towards the water, catching the last of the evening light.',
    description: [
      'Two offset volumes clad in rough stone are stacked and shifted so the upper floor reaches out over the terrace towards the lake.',
      'The composition is designed around sunset: deep overhangs shade the glazing through the day, while the water reflects the warm light back into the living spaces in the evening.',
    ],
    images: [proj('lakeside-1.jpg')],
  },
  {
    slug: 'brick-fin-pavilion',
    title: 'Brick Fin Pavilion',
    typology: 'Public / Cultural',
    storeys: 'Single volume',
    status: 'Concept',
    summary:
      'A curved brick enclosure lined with tall fins that turn the interior into a lantern after dark.',
    description: [
      'A single, gently curving brick wall wraps the space and is entered through a low arched opening. Along the long sides the wall dissolves into a series of tall brick fins that let light and air filter through.',
      'By day the fins cast moving shadows across the floor; at night the pavilion glows from within, its rhythm visible from across the landscape.',
    ],
    images: [proj('brick-fin-1.jpg'), proj('brick-fin-2.jpg'), proj('brick-fin-3.jpg')],
  },
  {
    slug: 'white-courtyard-villa',
    title: 'White Courtyard Villa',
    typology: 'Private residence',
    storeys: 'G + 1',
    status: 'Design proposal',
    summary: 'Simple white volumes arranged around a garden, tied together by a sculptural spiral stair.',
    description: [
      'The house is composed of plain white blocks set into a lush garden, each one framing a different view. Recessed balconies and slender black railings keep the forms crisp.',
      'A timber spiral stair rises through an open terrace between the volumes, linking the roof gardens and becoming the centrepiece of the plan.',
    ],
    images: [proj('courtyard-1.jpg'), proj('courtyard-2.jpg'), proj('courtyard-3.jpg')],
  },
]

const draw = (n) => `/images/drawings/d${String(n).padStart(2, '0')}.jpg`

export const drawingMediums = ['Watercolour', 'Ink & wash', 'Pen studies', 'Concept']

export const drawings = [
  { src: draw(2), title: 'Red brick façade', medium: 'Watercolour' },
  { src: draw(12), title: 'Corridor of discs', medium: 'Pen studies' },
  { src: draw(3), title: 'Domed gateway', medium: 'Ink & wash' },
  { src: draw(7), title: 'Cylinders and grids', medium: 'Pen studies' },
  { src: draw(4), title: 'House under the canopy', medium: 'Ink & wash' },
  { src: draw(9), title: 'Twisting columns', medium: 'Concept' },
  { src: draw(5), title: 'Concept notes', medium: 'Concept' },
  { src: draw(8), title: 'Folded planes', medium: 'Pen studies' },
  { src: draw(1), title: 'Worn boots, colour swatches', medium: 'Watercolour' },
  { src: draw(13), title: 'Disc wall study', medium: 'Pen studies' },
  { src: draw(10), title: 'River edge', medium: 'Concept' },
  { src: draw(6), title: 'Perspective with fineliners', medium: 'Pen studies' },
  { src: draw(11), title: 'Fractured volume', medium: 'Pen studies' },
]

const photo = (n) => `/images/photography/p${String(n).padStart(2, '0')}.jpg`

export const photographs = [
  { src: photo(4), title: 'Rickshaw rest', tone: 'Monochrome' },
  { src: photo(5), title: 'Glass and grid', tone: 'Monochrome' },
  { src: photo(1), title: 'Monsoon road', tone: 'Colour' },
  { src: photo(10), title: 'Afternoon nap', tone: 'Monochrome' },
  { src: photo(2), title: 'Footbridge at dusk', tone: 'Colour' },
  { src: photo(6), title: 'Morning tea', tone: 'Monochrome' },
  { src: photo(3), title: 'Crossing', tone: 'Colour' },
  { src: photo(9), title: 'Wires and palm', tone: 'Monochrome' },
  { src: photo(8), title: 'Stacked chairs', tone: 'Monochrome' },
  { src: photo(11), title: 'Brick under canopy', tone: 'Monochrome' },
  { src: photo(7), title: 'Sleeping under the wheel', tone: 'Colour' },
]
