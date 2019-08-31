import { connect } from "react-redux";
import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import { Button } from '@material-ui/core';
import { DialogBox } from '../styles/dialog';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import {
  setUtterContent,
  addUtterContent,
  undoTextRemotion,
  removeUtterContent,
  changeUtterForm
} from "../actions/uttersAction";

const ALTERNATIVES_TEXT = "como alternativas";
const SEQUENCE_TEXT = "em sequência";

class UtterForm extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      values: [SEQUENCE_TEXT, ALTERNATIVES_TEXT],
      value: (this.props.current_item !== undefined && this.props.current_item.have_alternatives) ? ALTERNATIVES_TEXT : SEQUENCE_TEXT,
      undoDelete: false
    }
  }

  
  changeTextarea = (utter_index, text_index, e) => {
    this.multilineTextarea.style.height = 'auto';
    this.multilineTextarea.style.height = this.multilineTextarea.scrollHeight + 'px';
    this.props.setUtterContent(utter_index, text_index, e.target.value, this.props.current_item)
  }

  handleDelete(utter_index, text_index) {
    const utters = this.props.current_item.alternatives;
    const utters_length = utters.length;
    const utters_text_length = utters[0].contents.length;

    if (utters_length > 1 || utters_text_length > 1) {
      this.setState({ undoDelete: true });
    }

    this.props.removeUtterContent(utter_index, text_index, this.props.current_item.alternatives);
  }

  handleUndo() {
    this.props.undoTextRemotion();
    this.setState({ undoDelete: false });
  }

  deleteSnack() {
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={this.state.undoDelete}
        autoHideDuration={3000}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">Deletado com sucesso!</span>}
        action={[
          <Button
            key="undo"
            color="secondary"
            size="small"
            onClick={() => this.handleUndo()}>
            Desfazer
        </Button>,
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={() => this.setState({ undoDelete: false })}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    )
  }

  setUtterContents() {
    let utters_texts = [];

    if (this.props.current_item.alternatives !== undefined) {
      utters_texts = this.props.current_item.alternatives.map((utter_text_list, utter_index) => {
        return utter_text_list.contents.map((utter_text, text_index) => {
          return (
            <li key={"utter_text" + utter_index + text_index}>
              <Grid container spacing={2} alignItems="flex-end" >
                <Grid item xs={11}>
                  <DialogBox className="dialog_box">
                    <textarea type="text" value={utter_text.text}
                      onChange={(e) => this.changeTextarea(utter_index, text_index, e)}
                      ref={ref => this.multilineTextarea = ref} />
                  </DialogBox>
                </Grid>
                <Grid item xs={1}>
                  <DeleteIcon
                    style={{ color: "#4b3953", opacity: 0.5 }}
                    type="button"
                    onClick={() => this.handleDelete(utter_index, text_index)}>
                  </DeleteIcon>
                </Grid>
              </Grid>
            </li>
          )
        })
      });
    }

    return utters_texts;
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    if((event.target.value !== this.props.current_item.have_alternatives)){
      this.props.changeUtterForm(this.props.current_item, (event.target.value === ALTERNATIVES_TEXT))
    }
  }

  getSelectedOption() {
    const items = this.props.current_item;
    return (items !== undefined && items.have_alternatives) ? ALTERNATIVES_TEXT : SEQUENCE_TEXT;
  }

  render() {
    return (
      <Grid container>
        <Grid item xs={1} />
        <Grid item xs={7}>
          <TextField
            fullWidth
            select
            margin="normal"
            variant="outlined"
            value={this.getSelectedOption()}
            id="outlined-select-currency"
            label="Balões aparecem:"
            onChange={(e) => this.handleChange(e)}>
            {(this.state.values).map((option, index) => (
              <MenuItem key={"menu" + index} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <ul>
            {this.setUtterContents()}
          </ul>

          <Grid container spacing={2} alignItems="flex-end" >
            {this.deleteSnack()}
            <Grid item xs={11}>
              <DialogBox
                style={{
                  opacity: "0.6",
                  filter: "drop-shadow(0px 2px 0px rgba(241, 80, 53, 0.3))"
                }}
                onClick={() => this.props.addUtterContent(this.props.new_utter)} >
                <textarea
                  readOnly
                  type="text"
                  style={{ cursor: "pointer" }}
                  placeholder="Novo balão de resposta" />
              </DialogBox>
            </Grid>
            <Grid item xs={1} />
          </Grid>

        </Grid>
        <Grid item xs={1} />
        <Grid item xs={3}>
          <pre>{JSON.stringify(this.props.current_item, null, 2)}</pre>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  return { ...state.utterReducer }
};

const mapDispatchToProps = dispatch => ({
  undoTextRemotion: () => dispatch(undoTextRemotion()),
  addUtterContent: (new_utter) => dispatch(addUtterContent(new_utter)),
  removeUtterContent: (utter_position, text_position) => dispatch(removeUtterContent(utter_position, text_position)),
  changeUtterForm: (have_alternatives, current_item) => dispatch(changeUtterForm(have_alternatives, current_item)),
  setUtterContent: (utter_position, text_position, text, current_item) => dispatch(setUtterContent(utter_position, text_position, text, current_item))
});

export default connect(mapStateToProps, mapDispatchToProps)(UtterForm);