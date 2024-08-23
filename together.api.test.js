const axios = require('axios');
const env = require('./config');

test('Scenario:1 retrieve top stories', async () => {
    const topStoriesResponse = await axios.get(`${env.apiUrl}/v0/topstories${env.prettyPrint}`);
    expect(topStoriesResponse.status).toBe(200);
    expect(topStoriesResponse.data.length).toBeLessThanOrEqual(500); //Validate Up to 500 top and new stories are at /v0/topstories
});

test('Scenario:2 retrieve current top story', async () => {
    const topStoriesResponse = await axios.get(`${env.apiUrl}/v0/topstories${env.prettyPrint}`);
    expect(topStoriesResponse.status).toBe(200);
    expect(topStoriesResponse.data.length).toBeGreaterThanOrEqual(1); //Validate has atleast one top story
    currentTopStoryId = topStoriesResponse.data[0]; //Assumption: Top stories response is sorted by time or score
    const currentTopStoryResponse = await axios.get(`${env.apiUrl}/v0/item/${currentTopStoryId}${env.prettyPrint}`);
    expect(currentTopStoryResponse.data).not.toBeNull;
    expect(currentTopStoryResponse.data['type']).toBe('story');
    console.log(`Current Top Story id: ${currentTopStoryId}`);
});

test('Scenario:3 retrieve first comment of the current top story', async () => {
    const topStoriesResponse = await axios.get(`${env.apiUrl}/v0/topstories${env.prettyPrint}`);
    storyCommentMap = {}; //variable to store pareant story -child comment mapping
    expect(topStoriesResponse.status).toBe(200);
    currentTopStoryId = topStoriesResponse.data[0];
    const currentTopStoryResponse = await axios.get(`${env.apiUrl}/v0/item/${currentTopStoryId}${env.prettyPrint}`);
    expect(currentTopStoryResponse.data['type']).toBe('story')
    kids = currentTopStoryResponse.data['kids'];
    for (const kid of kids) {   // Assumption: Kids array is sorted by time or score 
        const kidResponse = await axios.get(`${env.apiUrl}/v0/item/${kid}${env.prettyPrint}`);
        if (kidResponse.data['type'] === 'comment') {
            storyCommentMap[currentTopStoryId] = kid;
        }
    }
    console.log('************Top story:First comment********');
    console.log(storyCommentMap);
});

/**
 * This test currently fails since the top stories are not sorted by 'time' which could be the BUG mentioned in the take-home doc
 * Same implemetation can be done to test with 'score' as well. 
 */
test('Scenario:4 validate top stories response is sorted by time', async() => {
    /**
     * Iterate over all top stories
	    *   1. assert with story type
	    *   2. compare time stamp with previous item
     */
    const topStoriesResponse = await axios.get(`${env.apiUrl}/v0/topstories${env.prettyPrint}`);
    expect(topStoriesResponse.status).toBe(200);
    let previousStory = null;
    for (const topStory of topStoriesResponse.data) {
        if (previousStory == null) { // first entry in the array
            story = await axios.get(`${env.apiUrl}/v0/item/${topStory}${env.prettyPrint}`);
            expect(story.data['type']).toBe('story');
            previousStory = story;
        }
        else {
            story = await axios.get(`${env.apiUrl}/v0/item/${topStory}${env.prettyPrint}`);
            expect(story.data['type']).toBe('story');
            expect(story.data['time']).toBeLessThan(previousStory.data['time']); // Validate previous story has a more recent timestamp
            previousStory = story;
        }
        
    }
});





