import { test, expect, describe } from "bun:test";
import { parseArgv } from "bun";

describe("parse-argv", () => {
  test("parse argv with normal case", () => {
    const result = parseArgv([
      "bun",
      "script.js",
      "arg1",
      "--bool1",
      "--string1",
      "foo",
      "--num1",
      "123",
      "--string2",
      "bar",
      "--num2",
      "456",
      "arg2",
      "--bool2",
    ]);
    expect(result).toEqual({
      arguments: ["bun", "script.js", "arg1", "arg2"],
      flags: {
        bool1: true,
        bool2: true,
        string1: "foo",
        string2: "bar",
        num1: 123,
        num2: 456,
      },
    });
  });

  test("parse argv with continuing short flags", () => {
    const result = parseArgv(["bun", "script.js", "-abc", "foo", "-def"]);
    expect(result).toEqual({
      arguments: ["bun", "script.js"],
      flags: {
        a: true,
        b: true,
        c: "foo",
        d: true,
        e: true,
        f: true,
      },
    });
  });

  test("parse argv with end of options marker (--)", () => {
    test("flags before the marker are terminated", () => {
      const result = parseArgv(["bun", "script.js", "--foo", "foo", "--", "--bar", "bar", "-def"]);

      expect(result).toEqual({
        arguments: ["bun", "script.js", "--bar", "bar", "-def"],
        flags: {
          foo: "foo",
        },
      });
    });

    test("flags before the marker are not terminated", () => {
      const result = parseArgv(["bun", "script.js", "--foo", "--", "--bar", "bar", "-def"]);

      expect(result).toEqual({
        arguments: ["bun", "script.js", "--bar", "bar", "-def"],
        flags: {
          foo: true,
        },
      });
    });
  });

  test("parse argv with duplicated flags", () => {
    test("duplicated boolean flags", () => {
      const result = parseArgv(["bun", "script.js", "--foo", "--foo", "--foo"]);
      expect(result).toEqual({
        arguments: ["bun", "script.js"],
        flags: {
          foo: true,
        },
      });
    });

    test("duplicated multiple typed flags", () => {
      const result = parseArgv(["bun", "script.js", "--foo", "--foo", "string", "--foo", "123.45", "--foo"]);
      expect(result).toEqual({
        arguments: ["bun", "script.js"],
        flags: {
          foo: [true, "string", "123.45", true],
        },
      });
    });
  });

  test("parse argv with type force options", () => {
    const result = parseArgv(["bun", "script.js", "-b", "arg1", "--bool", "arg2", "-n", "123", "--num-str", "456"], {
      boolean_flags: ["b", "bool"],
      string_flags: ["n", "num-str"],
    });

    expect(result).toEqual({
      arguments: ["bun", "script.js", "arg1", "arg2"],
      flags: {
        b: true,
        bool: true,
        n: "123",
        "num-str": "456",
      },
    });
  });
});
