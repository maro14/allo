import React from 'react';

interface BoardHeaderProps {
  boardName: string;
}

const BoardHeader = ({ boardName }: BoardHeaderProps) => {
  return (
    <h1 className="text-2xl font-bold mb-4">{boardName}</h1>
  );
};

export default BoardHeader;