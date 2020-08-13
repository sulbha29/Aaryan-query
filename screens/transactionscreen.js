import React from 'react'
import {Text,View,TouchableOpacity,StyleSheet,TextInput,Image, 
  Alert,KeyboardAvoidingView} from 'react-native'
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import  firebase from 'firebase'
import db from '../config'
export default class TransactionScreen extends React.Component{
  constructor(){
    super()
      this.state={
        hascamerapermission:null,
        scanned:false,
       
        buttonState:'normal' ,
        scannedBookId:'',
        scanStudentId:'',
        transactionmsg:'',
        
      }
    }
  getcamerapermission= async(id)=>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({hascamerapermission:status==="granted",
    buttonState:id,scanned:false})
   }
   handlebarcodescanner= async({type,data})=>{
    const {buttonState} = this.state
    if(buttonState==="bookID"){
      this.setState({
        scanned:true,
        scannedBookId:data,
        buttonState:"normal"
      })
    }
    else if(buttonState==="studentID"){
    this.setState({scanned:true,
      buttonState:"normal",
    scanStudentId:data})
  }}
  initiatebookissue = async()=>{
    db.collection("transactions").add({
      studentID:this.state.scanStudentId,
      bookID:this.state.scannedBookId,
      date:firebase.firestore.Timestamp.now().toDate(),
      transcationType:"issue"
        })
        db.collection("books")
        .doc(this.state.scannedBookId)
        .update({bookavailibility:false})
        db.collection("students").doc(this.state.scanStudentid)
        .update({noofbooksissued:firebase.firestore.FieldValue.increment(1)})
   Alert.alert("book issued")
   this.setState({
     scannedBookId:'',
     scanStudentId:''
   })
  }
  initiatebookreturn = async()=>{
    db.collection("transactions").add({
      studentID:this.state.scanStudentId,
      bookID:this.state.scannedBookId,
      date:firebase.firestore.Timestamp.now().toDate(),
      transcationType:"return"
        })
        db.collection("books").doc(this.state.scannedBookId)
        .update({bookavailibility:true})
        db.collection("students").doc(this.state.scanStudentid)
        .update({noofbooksissued:
        firebase.firestore.FieldValue.increment(-1)})
   Alert.alert("book returned")
   this.setState({
    scannedBookId:'',
    scanStudentId:''
  })  
  }
 
  
  handleTransaction =async()=>{

    var transactionType = await this.checkbookeligibility();
    console.log("Transaction Type", transactionType)
    if(!transactionType){
      Alert.alert("book doesnt exist")
      this.setState({scannedBookId:"",scanStudentId:""})
    } 
    else if(transactionType=="issue"){
      var isStudenteligible = await 
      this.checkstudenteligibilityforbookissued()
      if(isStudenteligible){
       this.initiatebookissue();
       Alert.alert("book is issued to the student")
      }
   
    }
    else{
    var isStudenteligible = await
     this.checkstudenteligibilityforbookreturned()
    if(isStudenteligible){
      this.initiatebookreturn()
       Alert.alert("book return to library") 
      }
    }
   
   }
   checkstudenteligibilityforbookissued = async()=>{
     const studentref = await db.collection("students").
     where("studentID","==",this.state.scanStudentId).get()
     var studentElegible = ""
     if(studentref.docs.length==0){
      this.setState({scanStudentId:"",scannedBookId:""})
      studentElegible=false,
      Alert.alert("student id doesnt exist in the database")
     }
     else{
       studentref.docs.map((doc)=>{var student = doc.data()
         if(student.noofbooksissued<2){
           studentElegible = true
         }
         else{studentElegible = false
         Alert.alert("student has already issued 2 books")
         this.setState({scannedBookId:"",scanStudentId:""})}
         })
       
     }
    return studentElegible
    
   }
   checkstudenteligibilityforbookreturned = async()=>{
     const transactionref = await db.collection("transactions").
     where("bookID","==",this.state.scannedBookId).limit(1).get()
     var studentElegible = ""
     transactionref.docs.map((doc)=>{var lastbooktransaction = doc.data()
    if(lastbooktransaction.studentID===this.state.scanStudentId){
      studentElegible = true
    }
    else{
      studentElegible = false
      Alert.alert("book wasnt issued by the same student ")
      this.setState({scannedBookId:"",scanStudentId:""})
    }
    })

    return studentElegible
   }
   checkbookeligibility = async()=>{
     const bookref = await db.collection("books").where
     ("bookID","==",this.state.scannedBookId).get()
     var transactionType = ""
     if(bookref.docs.length == 0){
       transactionType = false
       console.log(bookRef.docs.length)
     }
     else{
       bookref.docs.map((doc)=>{var book = doc.data()})
       if(book.bookavailibility){
         transactionType = "issue"
       }
       else{
         transactionType = "return"
       }
     }
     return transactionType;
   }
  
     
     
   render(){
     const hascamerapermission = this.state.hascamerapermission; 
     const scanned = this.state.scanned
     const buttonState = this.state.buttonState
     if(buttonState!=="normal"&& hascamerapermission){
       return(
         <BarCodeScanner onBarCodeScanned =
          {scanned?undefined:
            this.handlebarcodescanner}
           style = {StyleSheet.absoluteFillObject}/>
  
       )
     }
     else if (buttonState=== "normal"){
    
   return(

    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      
    <View>
    
      <Image source = {require("../assets/booklogo.jpg")}
    style = {{width:40, height:50}}/>  
    <Text>libraryApp</Text> </View>
    <View style = {styles.inputView}>
  <TextInput style = {styles.inputBox}
    placeholder = "bookid"
     value={this.state.scannedBookId}/>
    <TouchableOpacity 
    style = {styles.scanButton}
    onPress = {()=>{
      this.getcamerapermission("bookID")}}>
     <Text style = 
     {styles.buttonText}> scan  </Text>
    </TouchableOpacity>

  </View>

  <View style = {styles.inputView}>
  <TextInput style = {styles.inputBox}
    placeholder = "studentid" 
    value = {this.state.scanStudentId}/>
    <TouchableOpacity style = 
    {styles.scanButton} 
    onPress = {()=>{
      this.getcamerapermission("studentID")
    }}>
     <Text style = 
     {styles.buttonText}> scan  </Text>
    </TouchableOpacity>
    </View>
    <Text>
      {this.state.transactionmsg}</Text>
   <TouchableOpacity onPress={async()=>{
     var transactionmsg=
     this.handleTransaction();
   }}>
     <Text>submit</Text>
   </TouchableOpacity>
  
   </KeyboardAvoidingView>
    
  
  
   )
   }
   }
  }



const styles = StyleSheet.create({
   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
   displayText:{ fontSize: 15, textDecorationLine: 'underline' },
    scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 },
     buttonText:{ fontSize: 15, textAlign: 'center', marginTop: 10 },
      inputView:{ flexDirection: 'row', margin: 20 },
       inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 },
        scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 },
         submitButton:{ backgroundColor: '#FBC02D', width: 100, height:50 },
          submitButtonText:{ padding: 10, textAlign: 'center', fontSize: 20, fontWeight:"bold", color: 'white' } })