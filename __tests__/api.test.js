import hello from '../pages/api/hello';

// this tests the hello API
describe("Check API functions:", () => {

  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      end: jest.fn(() => res)
    };
  });

  test("Hello should return name:John Doe", async () => {
    const output = await hello(req,res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ name: 'John Doe' });
  });

});