const { getAllPostComments, getSingle } = require('../controllers/comment'); // adjust path
const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');

jest.mock('../db/connect');

describe('Comment Routes - Basic Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
  });


  it('getAllPostComments returns data', async () => {
    req.params.id = new ObjectId().toString();
    
    const mockToArray = jest.fn().mockResolvedValue([{}, {}]);
    const mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
    mongodb.getDb = jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({ find: mockFind })
    });

    await getAllPostComments(req, res);

    const response = res.json.mock.calls[0][0];


    expect(response.length).toBeGreaterThan(0);
  });

  it('getSingle returns one item', async () => {
    req.params.id = new ObjectId().toString();
    
    const mockToArray = jest.fn().mockResolvedValue([{ _id: 123 }]);
    const mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
    mongodb.getDb = jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({ find: mockFind })
    });

    await getSingle(req, res);

    const response = res.json.mock.calls[0][0];

    
    expect(response).toBeDefined();
  });
});