import React, {Fragment, useState} from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    Rating,
    Typography
} from '@mui/material';

const ResultView = ({result}) => {

    return (
        <li className="sui-result">
            <div className="sui-result__header">
                <span className="sui-result__title"
                      dangerouslySetInnerHTML={{__html: result.title.raw}}/>
            </div>
            <div className="sui-result__body">
                <Grid container  spacing={2}>
                    {result.image && <Grid item>
                        <div className="sui-result__image"
                             style={{maxWidth: "200px", paddingLeft: "24px", paddingTop: "10px"}}>
                            <img src={result.image.raw} alt="thumb"
                                 style={{display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center"}}
                            />
                        </div>
                    </Grid>}
                    <Grid item sm container>
                        <Grid item xs container direction="column" spacing={1} style={{marginLeft: '20px'}}>
                            <Grid item>
                                {result.artists && <Typography gutterBottom variant="subtitle1" component="div">
                                    Artistas: {[result.artists.raw].flat().map(a => <Fragment key={a}><Chip size="small" color="primary" label={a}/>&nbsp;</Fragment>)}
                                </Typography>}
                                {result.genre && <Typography gutterBottom variant="subtitle1" component="div">
                                    Género: {[result.genre.raw].flat().map(g => <Fragment key={g}><Chip size="small" color="success" label={g}/>&nbsp;</Fragment>)}
                                </Typography>}
                                {result.place && <Typography gutterBottom variant="body2" component="div">
                                    Localización: {result.place.raw} {result.address && `- ${result.address.raw}`}
                                </Typography>}
                                {result.origin && <Typography gutterBottom variant="body2" component="div">
                                    Origen: <Chip size="small" color="secondary" label={result.origin.raw}/>
                                </Typography>}
                                {result.rating_score && <Typography gutterBottom variant="body2" component="div">
                                    <Rating name="score" value={result.rating_score.raw*5} readOnly/> ({result.rating_num.raw} opiniones)
                                </Typography>}
                            </Grid>
                            {result.tickets.raw.length > 0
                                ? <Grid item>
                                    <Box component={Paper} padding={1} marginRight={1}>
                                        <ul>
                                            {result.tickets.raw.map(t =>
                                                (<li key={t.date}>
                                                    <Typography gutterBottom variant="body2">{t.date.length > 10 ? new Date(t.date).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric' }) :  new Date(t.date).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric' })} - {t.price}€ <a href={t.link} target="_blank">Ver</a></Typography>
                                                </li>))}
                                        </ul>
                                    </Box>
                                </Grid>
                                : <Grid item>
                                    <Typography gutterBottom variant="body2" color="secondary">Sin entradas</Typography>
                                </Grid>}
                            {result.description && <Grid item>
                                <DescriptionDialog content={result.description.raw}/>
                            </Grid>}
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </li>
    );
}

const DescriptionDialog = ({content}) => {

    const [open, setOpen] = useState(false);

    return (
        <div>
            <Button variant="outlined" onClick={() => setOpen(true)}>+ info</Button>
            <Dialog open={open} onClose={() => setOpen(false)} scroll="paper">
                <DialogTitle id="scroll-dialog-title">Info</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText>
                        {content}
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ResultView;
