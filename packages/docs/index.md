# A Love Letter to `tsserver`

<div id="TableOfContents"></div>

Since I've been working with TypeScript in recent years, I've grown to love its type system quite a lot. I love how `tsserver` tells me off whenever I call functions with wrong parameters, or when I try to read data from non-existent object parameters, or when I try to return complete nonsensical data from functions. It just sits there, in the background, snickering at me and my mistakes. "Well, smarty-pants, since you're so smart with your smarts and knowledge of what is correct programming and what is not, why don't you just fix my code for me?" I said. And this gave me an idea: Why wouldn't I let `tsserver` fix my code for me?

Well, some of the code at least. In certain situations.

To paint a bit of a background picture, the projects that I've been exposed to in the recent years have all been quite similar:

- A React front-end running in the browser, that communicates with…
- A BFF (backend-for-frontend), which, in turn, collects data from…
- Various backend services and/or databases.

Each time we communicate across these gaps, data gets collected, transformed, transferred, read and finally distributed back. Even though compilation-time type safety would be rock-solid, there's very little we get for free when data is sent to and especially received from over the network.

My experience has taught me that the less we use overly broad data types, and the less we assume that an external service gives the data in a certain format, the less time I need to spend fixing bugs and researching unexpected system behavior.

## Components with Generics

<div id="GenericsSelect"></div>
