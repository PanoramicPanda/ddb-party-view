import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Grid } from '@mui/material';

const Passives = ({ character }) => (
    <Grid>
        <Grid item>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center"><b>Passive Perception</b></TableCell>
                            <TableCell align="center"><b>Passive Investigation</b></TableCell>
                            <TableCell align="center"><b>Passive Insight</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell align="center">{character.getPassivePerception()}</TableCell>
                            <TableCell align="center">{character.getPassiveInvestigation()}</TableCell>
                            <TableCell align="center">{character.getPassiveInsight()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    </Grid>
);

export default Passives;
