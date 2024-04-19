'use client';

import { useState } from 'react';
import { SpreadsheetData } from '@/types/types';
import Sidebar from '@/components/Sidebar';
import SingleSpreadsheet from '@/components/SingleSpreadsheet';
import '@copilotkit/react-ui/styles.css';
import {
  CopilotKit,
  useCopilotAction,
  useMakeCopilotReadable,
} from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { INSTRUCTIONS } from './instructions';
import { canonicalSpreadsheetData } from '@/utils/canonicalSpreadsheetData';
import { PreviewSpreadsheetChanges } from '@/components/PreviewSpreadsheetChanges';

const Main = () => {
  // Hold the title and data values within a spreadsheet
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetData[]>([
    {
      title: 'Spreadsheet 1',
      rows: [
        [{ value: '' }, { value: '' }, { value: '' }],
        [{ value: '' }, { value: '' }, { value: '' }],
        [{ value: '' }, { value: '' }, { value: '' }],
      ],
    },
  ]);

  // Represent the index of a spreadsheet
  const [selectedSpreadsheetIndex, setSelectedSpreadsheetIndex] =
    useState<number>(0);

  useCopilotAction({
    name: 'createSpreadsheet',
    description: 'Create a new  spreadsheet',
    parameters: [
      {
        name: 'rows',
        type: 'object[]',
        description: 'The rows of the spreadsheet',
        attributes: [
          {
            name: 'cells',
            type: 'object[]',
            description: 'The cells of the row',
            attributes: [
              {
                name: 'value',
                type: 'string',
                description: 'The value of the cell',
              },
            ],
          },
        ],
      },
      {
        name: 'title',
        type: 'string',
        description: 'The title of the spreadsheet',
      },
    ],
    render: props => {
      const { rows, title } = props.args;
      const newRows = canonicalSpreadsheetData(rows);

      return (
        <PreviewSpreadsheetChanges
          preCommitTitle='Create spreadsheet'
          postCommitTitle='Spreadsheet created'
          newRows={newRows}
          commit={rows => {
            const newSpreadsheet: SpreadsheetData = {
              title: title || 'Untitled Spreadsheet',
              rows,
            };
            setSpreadsheets(prev => [...prev, newSpreadsheet]);
            setSelectedSpreadsheetIndex(spreadsheets.length);
          }}
        />
      );
    },
    handler: ({ rows, title }) => {
      // Do nothing.
      // The preview component will optionally handle committing the changes.
    },
  });

  useMakeCopilotReadable(`Todays date is: ${new Date().toLocaleDateString()}`);

  return (
    <div className='flex'>
      <Sidebar
        spreadsheets={spreadsheets}
        selectedSpreadsheetIndex={selectedSpreadsheetIndex}
        setSelectedSpreadsheetIndex={setSelectedSpreadsheetIndex}
      />
      <SingleSpreadsheet
        spreadsheet={spreadsheets[selectedSpreadsheetIndex]}
        setSpreadsheet={spreadsheet => {
          setSpreadsheets(prev => {
            console.log('setSpreadsheet', spreadsheet);
            const newSpreadsheets = [...prev];
            newSpreadsheets[selectedSpreadsheetIndex] = spreadsheet;
            return newSpreadsheets;
          });
        }}
      />
    </div>
  );
};

const HomePage = () => {
  return (
    <CopilotKit url='/api/copilotkit'>
      <CopilotSidebar
        instructions={INSTRUCTIONS}
        labels={{
          initial:
            'Welcome to the AI-powered spreadsheet app! How can I help you?',
        }}
        defaultOpen={true}
        clickOutsideToClose={false}
      >
        <Main />
      </CopilotSidebar>
    </CopilotKit>
  );
};

export default HomePage;
