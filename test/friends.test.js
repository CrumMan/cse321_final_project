const { getFriends } = require('../controllers/user'); // adjust path
const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');

jest.mock('../db/connect');

describe('Friend Routes Tests', () => {
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

  it('getFriends returns friends data', async () => {
    req.params.id = new ObjectId().toString();
    
    const mockFriends = { 
      userId: new ObjectId(), 
      friends: ['friend1', 'friend2'] 
    };
    
    const mockFindOne = jest.fn().mockResolvedValue(mockFriends);
    mongodb.getDb = jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({ findOne: mockFindOne })
    });

    await getFriends(req, res);

    const response = res.json.mock.calls[0][0];


    expect(response).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getFriends returns 404 when no friends found', async () => {
    req.params.id = new ObjectId().toString();
    
    const mockFindOne = jest.fn().mockResolvedValue(null);
    mongodb.getDb = jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({ findOne: mockFindOne })
    });

    await getFriends(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'No friends found for user' 
    });
  });
});