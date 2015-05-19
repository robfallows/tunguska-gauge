describe('TunguskaGauge client Tests', function() {
  it('Is the TunguskaGauge object on the client?', function(test) {
    test.notEqual(typeof TunguskaGauge, 'undefined');
  });

  describe('Instantiated gauge tests', function() {
    var gauge;
    beforeAll(function(test) {
      var div = HTML.DIV({
        id: 'temp',
        style: 'display:none;'
      });

      Blaze.render(function() {
        return div;
      }, document.body);
      gauge = new TunguskaGauge({
        theme:'basic',
        id:'temp',
      });
      gauge.theme.range.lowStop = -3;
      gauge.theme.range.highStop = 103;
      gauge.theme.pointer.dynamics = {};
      gauge.theme.pointer.dynamics.duration = 1;
      gauge.theme.pointer.dynamics.easing = 'instant';
    });

    it('Can a new gauge be instantiated?', function(test) {
      test.notEqual(typeof gauge, 'undefined');
    });

    it('Does the gauge have the "basic" theme?', function(test) {
      test.equal(gauge.theme.theme, 'basic');
    });

    it('Can we set the gauge?', function(test, waitFor) {
      var result;
      gauge.theme.events = {
        onPointerStop: function(theme, value) {
          result = value;
        }
      }
      var onReady = function() {
        expect(result).equal(10);
      };
      gauge.set(10);
      Meteor.setTimeout(waitFor(onReady), 33); // need to allow for 16.7ms refresh if we've just missed one
    });

    describe('Pointer conversions (in-range)', function() {
      it('Check conversion of 0', function(test) {
        var Hi = -2.35619449019234,
          Lo = -2.35619449019235,
          value = gauge.__scaleValue(0),
          inRange = value > Lo && value < Hi;
        test.isTrue(inRange);
      });

      it('Check conversion of 20', function(test) {
        var Hi = -1.570796326794896,
          Lo = -1.570796326794897,
          value = gauge.__scaleValue(20),
          inRange = value > Lo && value < Hi;
        test.isTrue(inRange);
      });

      it('Check conversion of 60', function(test) {
        var Hi = 0.00000000000001,
          Lo = -0.-0000000000001,
          value = gauge.__scaleValue(60),
          inRange = value > Lo && value < Hi;
        test.isTrue(inRange);
      });

      it('Check conversion of 100', function(test) {
        var Hi = 1.570796326794897,
          Lo = 1.570796326794896,
          value = gauge.__scaleValue(100),
          inRange = value > Lo && value < Hi;
        test.isTrue(inRange);
      });
    });

    describe('Pointer conversions (out-of-range)', function() {
      it('Check conversion of 200', function(test) {
        var Hi = 1.68860605130452,
          Lo = 1.68860605130451,
          value = gauge.__scaleValue(200),
          inRange = value > Lo && value < Hi;
        test.isTrue(inRange);
      });

      it('Check conversion of -200', function(test) {
        var Hi = -2.47400421470195,
          Lo = -2.47400421470197,
          value = gauge.__scaleValue(-200),
          inRange = value > Lo && value < Hi;
        test.isTrue(inRange);
      });

    });
  });
});
