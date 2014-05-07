/*!
 * Copyright 2014 Francesco Camarlinghi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

; (function ()
{
    $.strict = true;

    // Allow stand-alone usage
    // (so we don't need to load the main library if we only need unit testing)
    if (typeof this.Lifter !== 'function')
        this.Lifter = function () { };

    var _funcNameRegex = /function (.{1,})\(/;

    /** @private Gets type name for the specified obj. */
    function _getTypeName(obj)
    {
        var results = (_funcNameRegex).exec(obj.constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    };

    /** @private Formats a string. */
    function _formatString()
    {
        var args = Array.prototype.slice.call(arguments);
        var formatted = args.shift().toString();

        for (arg in args)
            formatted = formatted.replace("{" + arg + "}", args[arg]);

        return formatted;
    };

    /** 
     * @private
     * Deep compares two objects. 
     * Source: http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    function _deepCompare()
    {
        var leftChain, rightChain;

        function compare2Objects(x, y)
        {
            var p;

            // remember that NaN === NaN returns false
            // and isNaN(undefined) returns true
            if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number')
                return true;

            // Compare primitives and functions.     
            // Check if both arguments link to the same object.
            // Especially useful on step when comparing prototypes
            if (x === y)
                return true;

            // Works in case when functions are created in constructor.
            // Comparing dates is a common scenario. Another built-ins?
            // We can even handle functions passed across iframes
            if ((typeof x === 'function' && typeof y === 'function') ||
               (x instanceof Date && y instanceof Date) ||
               (x instanceof RegExp && y instanceof RegExp) ||
               (x instanceof String && y instanceof String) ||
               (x instanceof Number && y instanceof Number))
            {
                return x.toString() === y.toString();
            }

            // At last checking prototypes as good a we can
            if (!(x instanceof Object && y instanceof Object))
                return false;

            if (x.isPrototypeOf(y) || y.isPrototypeOf(x))
                return false;

            if (x.constructor !== y.constructor)
                return false;

            if (x.prototype !== y.prototype)
                return false;

            // check for infinitive linking loops
            if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1)
            {
                return false;
            }

            // Quick checking of one object beeing a subset of another.
            // todo: cache the structure of arguments[0] for performance
            for (p in y)
            {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p))
                {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p])
                {
                    return false;
                }
            }

            for (p in x)
            {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p))
                {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p])
                {
                    return false;
                }

                switch (typeof (x[p]))
                {
                    case 'object':
                    case 'function':

                        leftChain.push(x);
                        rightChain.push(y);

                        if (!compare2Objects(x[p], y[p]))
                            return false;

                        leftChain.pop();
                        rightChain.pop();
                        break;

                    default:
                        if (x[p] !== y[p])
                            return false;
                        break;
                }
            }

            return true;
        }

        if (arguments.length < 1)
        {
            return true; //Die silently? Don't know how to handle such case, please help...
            // throw "Need two or more arguments to compare";
        }

        for (var i = 1, l = arguments.length; i < l; i++)
        {
            leftChain = []; //todo: this can be cached
            rightChain = [];

            if (!compare2Objects(arguments[0], arguments[i]))
                return false;
        }

        return true;
    };

    /** 
     * @private
     * Gets object own enumerable properties.
     * Sources: QUnit source and 
     * http://stackoverflow.com/questions/7306669/how-to-get-all-properties-values-of-a-javascript-object-without-knowing-the-key
     */
    function _objectValues(obj)
    {
        var key, val, result = obj instanceof Array ? [] : {};

        for (key in obj)
        {
            if (obj.hasOwnProperty(key))
            {
                val = obj[key];
                result[key] = (val === Object(val)) ? _objectValues(val) : val;
            }
        }

        return result;
    };

    /** @private Assert functions. */
    var _assert = function ()
    {
        var context = this;

        return {
            /**
             * A boolean check, passes if the first argument is truthy.
             *
             * @param   {Expression|Function} state Expression or function being tested.
             * @param   {String} message A short description of the assertion.
             */
            ok: function (state, message)
            {
                context.run++;

                if (typeof state === 'function')
                    try { state = state.call(null); } catch (e) { state = false; }

                if (typeof message !== 'string' || !message.length)
                    throw new Error('Invalid assert message.');

                if (state)
                {
                    if (Lifter.test.verbose)
                        Lifter.test.print('PASS. ' + message);
                    context.passed++;
                }
                else
                {
                    Lifter.test.print('FAIL. ' + message);
                    context.failed++;
                }
            },

            /**
             * A boolean check, passes if the first argument is falsy.
             *
             * @param   {Expression|Function} state Expression or function being tested.
             * @param   {String} message A short description of the assertion.
             */
            fail: function (state, message)
            {
                if (typeof state === 'function')
                    try { state = state.call(null); } catch (e) { state = false; }

                this.ok(!state, message);
            },

            /**
             * A non-strict comparison, checking for equality.
             *
             * @param   {any} actual Object being tested.
             * @param   {any} expected Known comparison value.
             * @param   {String} message A short description of the assertion.
             */
            equal: function (actual, expected, message)
            {
                this.ok(actual == expected, message);
            },

            /**
             * A non-strict comparison, checking for inequality.
             *
             * @param   {any} actual Object being tested.
             * @param   {any} expected Known comparison value.
             * @param   {String} message A short description of the assertion.
             */
            notEqual: function (actual, expected, message)
            {
                this.ok(actual != expected, message);
            },

            /**
             * A strict comparison, checking for inequality.
             *
             * @param   {any} actual Object being tested.
             * @param   {any} expected Known comparison value.
             * @param   {String} message A short description of the assertion.
             */
            strictEqual: function (actual, expected, message)
            {
                this.ok(actual === expected, message);
            },

            /**
             * A strict comparison, checking for inequality.
             *
             * @param   {any} actual Object being tested.
             * @param   {any} expected Known comparison value.
             * @param   {String} message A short description of the assertion.
             */
            notStrictEqual: function (actual, expected, message)
            {
                this.ok(actual !== expected, message);
            },

            /**
             * Tests that the passed object is of the specified type.
             *
             * @param   {any} actual Object being tested.
             * @param   {any} expected Known comparison value.
             * @param   {String} message A short description of the assertion.
             */
            type: function (actual, expected, message)
            {
                message = message || 'Object is of type ' + expected;

                if (!actual)
                    this.ok(false, message);

                var objType = _getTypeName(actual);
                expected = (typeof expected === 'string') ? expected : _getTypeName(expected);
                this.ok(objType.toLowerCase() === expected.toLowerCase(), message);
            },

            /**
             * Test if a callback throws an exception, and optionally compare the thrown error.
             *
             * @param   {Function} state Function to execute.
             * @param   {String|RegExp|Function} [expected] Expected error.
             * @param   {String} [message] A short description of the assertion.
             */
            error: function (state)
            {
                // Parse args
                if (typeof state !== 'function')
                    throw new Error('Invalid assert function.');

                var expected,
                    message,
                    actual;

                if (arguments.length === 2)
                {
                    message = arguments[1];
                }
                else if (arguments.length === 3)
                {
                    expected = arguments[1];
                    message = arguments[2];
                }
                else
                {
                    expected = null;
                    message = 'throws an error';
                }

                // Assert
                try
                {
                    state.call(null);
                    this.ok(false, message);
                }
                catch (e)
                {
                    actual = e;
                }

                // Evaluate error
                if (actual)
                {
                    if (!expected || actual instanceof expected)
                    {
                        this.ok(true, message);
                    }
                    else if (expected instanceof Error)
                    {
                        this.ok(function ()
                        {
                            return actual instanceof Error &&
                                   actual.name === expected.name &&
                                   actual.message === expected.message;
                        }, message);
                    }
                    else if (_getTypeName(expected) === 'regexp')
                    {
                        this.ok(expected.test(actual.toString()), message);
                    }
                    else if (typeof expected === 'function')
                    {
                        this.ok(expected.call({}, actual), message)
                    }
                    else
                    {
                        this.ok(false, message);
                    }
                }
                else
                {
                    this.ok(false, message);
                }
            },

            /**
             * A strict deep comparison, checking for equality. 
             *
             * @param   {any} actual Object being tested.
             * @param   {any} expected Known comparison value.
             * @param   {String} message A short description of the assertion.
             */
            deepEqual: function (actual, expected, message)
            {
                this.ok(_deepCompare(actual, expected), message);
            },

            /**
             * A strict deep comparison, checking for inequality. 
             *
             * @param   {any} actual Object being tested.
             * @param   {any} expected Known comparison value.
             * @param   {String} message A short description of the assertion.
             */
            notDeepEqual: function (actual, expected, message)
            {
                this.ok(!_deepCompare(actual, expected), message);
            },

            /**
             * A strict comparison of an object's own properties, checking for equality. 
             *
             * @param   {any} actual Object being tested.
             * @param   {any} expected Known comparison value.
             * @param   {String} message A short description of the assertion.
             */
            propEqual: function (actual, expected, message)
            {
                this.ok(function ()
                {
                    actual = _objectValues(actual);
                    expected = _objectValues(expected);
                    return _deepCompare(actual, expected);
                }, message);
            },

            /**
             * A strict comparison of an object's own properties, checking for inequality. 
             *
             * @param   {any} actual Object being tested.
             * @param   {any} expected Known comparison value.
             * @param   {String} message A short description of the assertion.
             */
            notPropEqual: function (actual, expected, message)
            {
                this.ok(function ()
                {
                    actual = _objectValues(actual);
                    expected = _objectValues(expected);
                    return !_deepCompare(actual, expected);
                }, message);
            },
        }
    };

    /**
     * Runs an unit test.
     * 
     * @param   {String} name Unit test name.
     * @param   {Function} test Unit test block.
     */
    Lifter.test = function (name, test)
    {
        if (typeof name !== 'string' || name.length === 0)
            throw new Error('Invalid test name.');

        if (typeof test !== 'function')
            throw new Error('Invalid test function.');

        var t = new Timer(),
            context = {
                run: 0,
                passed: 0,
                failed: 0,
            };

        // Run unit test
        try
        {
            t.start();
            test.call(null, _assert.call(context));
        }
        catch (e)
        {
            Lifter.test.print('Exception thrown during test: "{0}".', e.message);
        }
        finally
        {
            t.stop();
            Lifter.test.print(name + ' ({3}s, {0} passed, {1} failed, {2} total)', context.passed, context.failed, context.run, t.elapsedTime);
        }
    };

    /** 
     * Whether verbose mode is on. Normally only fail messages will
     * be print to log. With this set to true everything will be printed.
     * 
     * @property Lifter.test.verbose
     * @type Boolean
     * @default false
     */
    Lifter.test.verbose = false;

    /**
     * Prints the passed message to the console.
     *
     * @param   {String} message Message to print.
     * @param   {Any} args Substitution parameters.
     */
    Lifter.test.print = function ()
    {
        $.writeln(_formatString.apply(null, Array.prototype.slice.call(arguments)));
    };


    /**
     * A very precise timer, useful for profiling.
     * 
     * @class Timer
     */
    var Timer = Lifter.Timer = function Timer()
    {
        $.hiresTimer;
        this.startTime = -1;
        this.endTime = -1;
        this.elapsedTime = -1;
    };

    /**
     * Starts the timer.
     */
    Timer.prototype.start = function ()
    {
        this.startTime = $.hiresTimer;
        return this;
    };

    /**
     * Stops the timer, optionally printing a log message.
     * 
     * @param   {String} [message] Log message.
     */
    Timer.prototype.stop = function (message)
    {
        this.endTime = $.hiresTimer;
        this.elapsedTime = Math.max((this.endTime - this.startTime) / 1000000.0, 0.0);
        return this.print(message);
    };

    /**
     * Prints a log message along with elapsed time to the console.
     * 
     * @param   {String} message Log message.
     */
    Timer.prototype.print = function (message)
    {
        if (typeof message === 'string' && message.length)
            $.writeln([message, this.elapsedTime].join(' '));
        return this;
    };

    /**
     * Profiles a function by executing it the specified number of times.
     * 
     * @param   {Function} fn Function to profile.
     * @param   {Number} times Number of executions.
     * @param   {Object} [context] Function context.
     */
    Timer.prototype.repeat = function (fn, times /*, context */)
    {
        if (typeof fn !== 'function')
            throw new TypeError('"fn" must be a function.');

        if (typeof times !== 'number')
            throw new TypeError('"times" must be a number.');

        times = Math.abs(Math.ceil(times));
        var i = 0,
            context = arguments.length >= 3 ? arguments[2] : void 0;;

        try
        {
            this.start();
            for (; i < times; i++)
                fn.call(context);
        }
        catch (e)
        {
            throw e;
        }
        finally
        {
            this.stop();
            this.elapsedTime /= times;
        }

        return this;
    };

}).call($.global);