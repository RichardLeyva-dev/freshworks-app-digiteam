import React from 'react';

export interface HelloWorldProps {
  text: string;
}

export function HelloWorld({ text }: HelloWorldProps) {
  return <h1 className="text-blue-600 font-bold">{text}</h1>;
}
