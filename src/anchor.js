(function(Two) {

  // Localized variables
  var commands = Two.Commands;
  var _ = Two.Utils;

  /**
   * An object that holds 3 `Two.Vector`s, the anchor point and its
   * corresponding handles: `left` and `right`.
   */
  var Anchor = Two.Anchor = function(x, y, ux, uy, vx, vy, command) {

    Two.Vector.call(this, x, y);

    this._broadcast = _.bind(function() {
      this.trigger(Two.Events.change);
    }, this);

    this._command = command || commands.move;
    this._relative = true;

    if (!command) {
      return this;
    }

    Anchor.AppendCurveProperties(this);

    if (_.isNumber(ux)) {
      this.controls.left.x = ux;
    }
    if (_.isNumber(uy)) {
      this.controls.left.y = uy;
    }
    if (_.isNumber(vx)) {
      this.controls.right.x = vx;
    }
    if (_.isNumber(vy)) {
      this.controls.right.y = vy;
    }

  };

  _.extend(Anchor, {

    AppendCurveProperties: function(anchor) {
      anchor.relative = true;
      anchor.controls = {
        left: new Two.Vector(0, 0),
        right: new Two.Vector(0, 0)
      };
    },

    MakeObservable: function(object) {

      Object.defineProperty(object, 'command', {

        enumerable: true,

        get: function() {
          return this._command;
        },

        set: function(c) {
          this._command = c;
          if (this._command === commands.curve && !_.isObject(this.controls)) {
            Anchor.AppendCurveProperties(this);
          }
          return this.trigger(Two.Events.change);
        }

      });

      Object.defineProperty(object, 'relative', {

        enumerable: true,

        get: function() {
          return this._relative;
        },

        set: function(b) {
          if (this._relative == b) {
            return this;
          }
          this._relative = !!b;
          return this.trigger(Two.Events.change);
        }

      });

      _.extend(object, Two.Vector.prototype, AnchorProto);

      // Make it possible to bind and still have the Anchor specific
      // inheritance from Two.Vector
      object.bind = object.on = function() {
        var bound = this._bound;
        Two.Vector.prototype.bind.apply(this, arguments);
        if (!bound) {
          _.extend(this, AnchorProto);
        }
      };

    }

  });

  var AnchorProto = {

    listen: function() {

      if (!_.isObject(this.controls)) {
        Anchor.AppendCurveProperties(this);
      }

      this.controls.left.bind(Two.Events.change, this._broadcast);
      this.controls.right.bind(Two.Events.change, this._broadcast);

      return this;

    },

    ignore: function() {

      this.controls.left.unbind(Two.Events.change, this._broadcast);
      this.controls.right.unbind(Two.Events.change, this._broadcast);

      return this;

    },

    copy: function(v) {

      this.x = v.x;
      this.y = v.y;

      if (_.isString(v.command)) {
        this.command = v.command;
      }
      if (_.isObject(v.controls)) {
        if (!_.isObject(this.controls)) {
          Anchor.AppendCurveProperties(this);
        }
        // TODO: Do we need to listen here?
        this.controls.left.copy(v.controls.left);
        this.controls.right.copy(v.controls.right);
      }
      if (_.isBoolean(v.relative)) {
        this.relative = v.relative;
      }

      return this;

    },

    clone: function() {

      var controls = this.controls;

      var clone = new Two.Anchor(
        this.x,
        this.y,
        controls && controls.left.x,
        controls && controls.left.y,
        controls && controls.right.x,
        controls && controls.right.y,
        this.command
      );
      clone.relative = this._relative;
      return clone;

    },

    toObject: function() {
      var o = {
        x: this.x,
        y: this.y
      };
      if (this._command) {
        o.command = this._command;
      }
      if (this._relative) {
        o.relative = this._relative;
      }
      if (this.controls) {
        o.controls = {
          left: this.controls.left.toObject(),
          right: this.controls.right.toObject()
        };
      }
      return o;
    },

    toString: function() {
      if (!this.controls) {
        return [this._x, this._y].join(', ');
      }
      return [this._x, this._y, this.controls.left.x, this.controls.left.y,
        this.controls.right.x, this.controls.right.y].join(', ');
    }

  };

  Anchor.MakeObservable(Two.Anchor.prototype);

})((typeof global !== 'undefined' ? global : (this || window)).Two);
