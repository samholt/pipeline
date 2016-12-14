// Load all the data and merge it together.
//  - posts.json
//  - data/journal.json
//  - data/doi.json
//  - data/clock.json
//  - a posts/+ post.githubRepo +/package.json for each in posts.json
// Verify every post.json has a doi (if null, assign new unique). Save changes.
// Verify every post.json has a published time in clock (if null, assign date.now). Save changes.
// Update clock.updated with the current git commit time for every post.json. Save changes.
// Pass composed data to next pipe
