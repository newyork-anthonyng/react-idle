import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import ReactIdle from "../src";

jest.useFakeTimers();

let node;
const eventMap = {};
beforeEach(() => {
  node = document.createElement("div");

  window.addEventListener = jest.fn((eventName, cb) => {
    eventMap[eventName] = cb;
  });
  window.removeEventListener = jest.fn(eventName => {
    eventMap[eventName] = undefined;
  });
});

afterEach(() => {
  unmountComponentAtNode(node);
});

it("should attach event listeners when mounting", () => {
  render(<ReactIdle />, node, () => {
    expect(eventMap).toMatchSnapshot();
  });
});

it("should remove event listeners when unmounting", () => {
  render(<ReactIdle />, node);
  unmountComponentAtNode(node);

  expect(eventMap).toMatchSnapshot();
});

it("should call onChange function with correct argument when component becomes idle", () => {
  const cb = jest.fn();
  render(<ReactIdle onChange={cb} />, node);

  jest.runAllTimers();

  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb.mock.calls[0][0]).toMatchSnapshot();
});

it("should call onChange function with correct argument when component becomes active", () => {
  const cb = jest.fn();
  render(<ReactIdle onChange={cb} defaultIdle />, node);

  eventMap.mousemove();

  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb.mock.calls[0][0]).toMatchSnapshot();
});

it("should not call onChange function when component is active, and event happens", () => {
  const cb = jest.fn();
  render(<ReactIdle onChange={cb} />, node);

  eventMap.mousemove();

  expect(cb).toHaveBeenCalledTimes(0);
});

it("should call render function with correct argument when component is idle", () => {
  let isIdle;
  render(
    <ReactIdle
      render={({ idle }) => {
        isIdle = idle;
        return null;
      }}
    />,
    node
  );

  jest.runAllTimers();

  expect(isIdle).toEqual(true);
});

it("should call render function with correct argument when component is active", () => {
  let isIdle;
  render(
    <ReactIdle
      render={({ idle }) => {
        isIdle = idle;
        return null;
      }}
    />,
    node
  );

  expect(isIdle).toEqual(false);
});

it("should set default idle state to true", () => {
  let isIdle;
  render(
    <ReactIdle
      defaultIdle
      render={({ idle }) => {
        isIdle = idle;
        return null;
      }}
    />,
    node
  );

  expect(isIdle).toEqual(true);
});

it("should update event listeners correctly", () => {
  render(<ReactIdle />, node);
  render(<ReactIdle events={["foo"]} />, node);

  expect(eventMap).toMatchSnapshot();
});
