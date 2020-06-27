import { DialogueWiseRequest, DialogueWiseService } from '../index';
test('My DialogueWiseService', async () => {
  let request: DialogueWiseRequest = {
    slug: 'hero-section',
    apiKey: 'b1266377591c4f2a9494c3abdd2cac5381D6Z825D26CEBAE8B6rn',
    emailHash: '/kgmM46s1xC56BOFWRZp4j+0bdU19URpXdNT9liAX50=',
  };

  let dialogueWiseService = new DialogueWiseService();
  let res = await dialogueWiseService.getDialogue(request);
  expect(res['totalRecords']).toEqual(2);
  expect(res['error']).toBe('');
});
