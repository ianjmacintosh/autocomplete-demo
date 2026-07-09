# Size Tier is coupled to a themed Corpus, not an independent slider

Each Size Tier (100 / 1,000 / 10,000 / 100,000) has its own fixed, themed, real-world Corpus (periodic elements / cheese types / world cities / Open Library book titles) rather than Size Tier and Corpus content being independent controls over one master dataset.

We considered making them orthogonal — any theme at any size, by slicing/sampling one large real corpus — which would isolate scale as a clean, confound-free performance variable. We deliberately chose the coupled version instead: distinct real datasets per tier are more memorable and "stealable" for visitors than four arbitrary-sized slices of the same list, even though it means a visitor comparing performance across tiers is also comparing across differently-shaped strings (short element names vs. long book titles), not size in isolation.
