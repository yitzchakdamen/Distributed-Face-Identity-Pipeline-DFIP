import React, { useState } from 'react';
import MongoGallery from '../components/MongoGallery';
import MongoAlerts from '../components/MongoAlerts';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`mongo-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MongoPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        MongoDB Data Viewer
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View persons gallery and security alerts from the database.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Persons Gallery" id="mongo-tab-0" />
          <Tab icon={<WarningIcon />} iconPosition="start" label="Security Alerts" id="mongo-tab-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <MongoGallery />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <MongoAlerts />
      </TabPanel>
    </Box>
  );
};

export default MongoPage;
