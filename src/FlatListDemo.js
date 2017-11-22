import React, {Component} from "react";
import {
    ActivityIndicator, 
    FlatList, 
    StyleSheet, 
    Text, 
    View
} from "react-native";

const REQUEST_URL = 'https://api.github.com/search/repositories?q=javascript&sort=stars&page=';
let pageNo = 1;//current page number
let totalPage=5;
let itemNo=0;//item's count
export default class FlatListDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            error: false,
            errorInfo: "",
            dataArray: [],
            showFoot:0, // foot， 0：hide footer  1：show 'all data loaded'   2 ：show 'loading more data'
            isRefreshing:false,
        }

        // bind this for these 4 functions, cause FlatList footer can not be render
        this._renderFooter=this._renderFooter.bind(this)
        this._onEndReached=this._onEndReached.bind(this)
        this._separator = this._separator.bind(this)
    }

    fetchData(pageNo) {
        fetch(REQUEST_URL+pageNo)
            .then((response) => response.json())
            .then((responseData) => {
                let data = responseData.items;
                let dataBlob = [];
                let i = itemNo;

                data.map(function (item) {
                    dataBlob.push({
                        key: i,
                        value: item,
                    })
                    i++;
                });
                itemNo = i;
                console.log("itemNo:"+itemNo);
                let foot = 0;
                if(pageNo>=totalPage){
                    foot = 1; // no more data,show 'all data loaded'
                }

                this.setState({
                    dataArray:this.state.dataArray.concat(dataBlob),
                    isLoading: false,
                    showFoot:foot,
                    isRefreshing:false,
                });
                data = null;
                dataBlob = null;
            })
            .catch((error) => {
                this.setState({
                    error: true,
                    errorInfo: error
                })
            })
            .done();
    }

    componentDidMount() {
        this.fetchData( pageNo );
    }

    renderLoadingView() {
        console.log('renderLoadingView')
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    animating={true}
                    color='red'
                    size="large"
                />
            </View>
        );
    }

    renderErrorView() {
        return (
            <View style={styles.container}>
                <Text>
                    Fail
                </Text>
            </View>
        );
    }

    _renderItemView({item}) {
        return (
            <View>
                <Text style={styles.title}>name: {item.value.name}</Text>
                <Text style={styles.content}>stars: {item.value.stargazers_count}</Text>
                <Text style={styles.content}>description: {item.value.description}</Text>
            </View>
        );
    }

    renderData() {
        console.log('renderData')
        return (
            <FlatList
                data={this.state.dataArray}
                renderItem={this._renderItemView}

                ListFooterComponent={this._renderFooter}
                onEndReached={this._onEndReached}
                onEndReachedThreshold={1}
                ItemSeparatorComponent={this._separator}
                // above functions which has been bind this in component constructor, FlatList Footer would not render
                
                // // below functions called bind this here, FlatList Footer renders fun
                // ListFooterComponent={this._renderFooter.bind(this)}
                // onEndReached={this._onEndReached.bind(this)}
                // onEndReachedThreshold={1}
                // ItemSeparatorComponent={this._separator.bind(this)}
            />

        );
    }

    render() {
        console.log('render')
        if (this.state.isLoading && !this.state.error) {
            return this.renderLoadingView();
        } else if (this.state.error) {
            return this.renderErrorView();
        }
        return this.renderData();
    }
    _separator(){
        return <View style={{height:1,backgroundColor:'#999999'}}/>;
    }
    _renderFooter(){
        console.log('_renderFooter')
        if (this.state.showFoot === 1) {
            return (
                <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
                    <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
                        No more data
                    </Text>
                </View>
            );
        } else if(this.state.showFoot === 2) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator />
                    <Text>loading more data...</Text>
                </View>
            );
        } else if(this.state.showFoot === 0){
            return null;
            // return (
            //     <View style={styles.footer}>
            //         <Text></Text>
            //     </View>
            // );
        }
    }

    _onEndReached(){
        console.log('onEndReached this.state.showFoot', this.state.showFoot);
        if(this.state.showFoot != 0 ){
            return ;
        }
        if((pageNo!=1) && (pageNo>=totalPage)){
            return;
        } else {
            pageNo++;
        }
        this.setState({showFoot:2}, () => {
            this.fetchData( pageNo );
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    title: {
        fontSize: 15,
        color: 'blue',
    },
    footer:{
        flexDirection:'row',
        height:24,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:10,
    },
    content: {
        fontSize: 15,
        color: 'black',
    }
});