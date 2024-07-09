import { forward, instruct, reply } from '../../src/index.js';


describe('EventMacros', () => {
  describe('instruct', () => {
    it('should add an instruction to slots with options', () => {
      const slot = instruct('instruction', {id: '123', persist: true}).toJSON(true);
      expect(slot).toEqual([
        {
          instructions: {
            content: 'instruction',
            id: '123',
            persist: true
          }
        }
      ]);
    });

    it('should add a simple instruction to slots', () => {
      const slot = instruct('simple instruction').toJSON(true);
      expect(slot).toEqual([
        {
          instructions: 'simple instruction'
        }
      ]);
    });
  });

  describe('forward', () => {
    it('should add a forward slot with options', () => {
      const slot = forward('message', {mode: 'after-reply', to: 'test@example.com'}).toJSON(true);
      expect(slot).toEqual([
        {
          forward: {
            note: 'message',
            mode: 'after-reply',
            to: 'test@example.com'
          },
          forwardNote: 'message'
        }
      ]);
    });

    it('should add a simple forward slot', () => {
      const slot = forward('simple forward').toJSON(true);
      expect(slot).toEqual([
        {
          forward: true,
          forwardNote: 'simple forward'
        }
      ]);
    });
  });

  describe('reply', () => {
    it('should add a reply slot with scheduled date', () => {
      const scheduledDate = new Date();
      const slot = reply('message', {scheduled: scheduledDate}).toJSON(true);
      expect(slot).toEqual([
        {
          message: 'message',
          scheduled: parseInt((scheduledDate.getTime() / 1000).toFixed(0))
        }
      ]);
    });

    it('should add a reply slot with delay', () => {
      const slot = reply('message', {delay: 5}).toJSON(true);
      expect(slot).toEqual([
        {
          message: 'message',
          secondsDelay: 5
        }
      ]);
    });

    it('should throw an error for non-number delay', () => {
      expect(() => reply('message', {delay: '5'})).toThrow('.delay is not of type "number"');
    });

    it('should add a simple reply slot', () => {
      const slot = reply('simple reply').toJSON(true);
      expect(slot).toEqual([
        {
          message: 'simple reply'
        }
      ]);
    });
  });
});
