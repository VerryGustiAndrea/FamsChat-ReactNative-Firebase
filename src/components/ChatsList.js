import React, {Component} from 'react';
import {
  Text,
  Left,
  Body,
  Right,
  Content,
  List,
  ListItem,
  Thumbnail,
  Badge,
} from 'native-base';
import firebase from 'react-native-firebase';

class ChatsList extends Component {
  state = {
    selectedChat: null,
    email: '',
    chats: [],
  };

  selectedChat = async (data, index) => {
    await this.setState({selectedChat: index});
    await this.props.screen.navigation.navigate('ChatView', {
      user: data,
    });
    this.messageRead();
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(async _usr => {
      await firebase
        .firestore()
        .collection('chats')
        .where('users', 'array-contains', _usr.email)
        .onSnapshot(async res => {
          const chats = res.docs.map(_doc => _doc.data());
          await this.setState({
            email: _usr.email,
            chats: chats,
          });
        });
    });
  }

  buildDocKey = friend => [this.state.email, friend].sort().join(':');

  messageRead = () => {
    const docKey = this.buildDocKey(
      this.state.chats[this.state.selectedChat].users.filter(
        _usr => _usr !== this.state.email,
      )[0],
    );

    if (
      this.state.chats[this.state.selectedChat].messages[
        this.state.chats[this.state.selectedChat].messages.length - 1
      ].sender !== this.state.email
    ) {
      firebase
        .firestore()
        .collection('chats')
        .doc(docKey)
        .update({receiverHasRead: 0});
    } else {
      console.log('Clicked message sender!');
    }
  };

  render() {
    return (
      <>
        {this.state.chats.length > 0 ? (
          <Content>
            {this.state.chats.map((_chat, _index) => {
              return (
                <List key={_index}>
                  <ListItem
                    noBorder
                    avatar
                    button
                    onPress={() => this.selectedChat(_chat.users, _index)}>
                    <Left>
                      <Thumbnail
                        source={{
                          uri:
                            'https://dummyimage.com/300x300/008cff/ffffff.jpg',
                        }}
                      />
                    </Left>
                    <Body>
                      <Text>
                        {_chat.users.filter(
                          _user => _user !== this.state.email,
                        )}
                      </Text>
                      <Text note>
                        {_chat.messages[
                          _chat.messages.length - 1
                        ].message.substring(0, 30)}
                      </Text>
                    </Body>
                    <Right>
                      {_chat.receiverHasRead > 0 &&
                      _chat.messages[_chat.messages.length - 1].sender !==
                        this.state.email ? (
                        <Badge>
                          <Text>{_chat.receiverHasRead}</Text>
                        </Badge>
                      ) : null}
                    </Right>
                  </ListItem>
                </List>
              );
            })}
          </Content>
        ) : null}
      </>
    );
  }
}

export default ChatsList;
