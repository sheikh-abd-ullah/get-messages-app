// import React, { useEffect, useState } from "react";
// import {
//   SafeAreaView,
//   Text,
//   PermissionsAndroid,
//   Alert,
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import SmsAndroid from "react-native-get-sms-android";
// import { FIREBASE_AUTH, FIRESTORE_DB } from "./FirebaseConfig"; // Assuming FirebaseConfig contains initialized Firestore instance
// import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
// import {
//   getAuth,
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
// } from "firebase/auth"; // Import Firebase auth methods

// const App = () => {
//   const [dustbinFillLevel, setDustbinFillLevel] = useState(null);
//   const [dustbinLocation, setDustbinLocation] = useState(null);
//   const [lastSentMessageBody, setLastSentMessageBody] = useState(null); // State to track the last sent message
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [lastTimestamp, setLastTimestamp] = useState(Date.now());
//   const [user, setUser] = useState(null); // Add state for user
//   const phoneNumber = "+923400853168";
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

  

//   // useEffect(() => {
//   //   const auth = getAuth();
//   //   // Replace with your actual email and password for signing in
//   //   // const email = "bsf2000884@ue.edu.pk";
//   //   // const password = "123456";

//   //   signInWithEmailAndPassword(auth, email, password)
//   //     .then((userCredential) => {
//   //       setUser(userCredential.user);
//   //     })
//   //     .catch((error) => {
//   //       console.error("Error signing in: ", error.message);
//   //     });

//   //   const unsubscribe = onAuthStateChanged(auth, (user) => {
//   //     if (user) {
//   //       setUser(user); // Set the user when authenticated
//   //     } else {
//   //       // Handle user not signed in
//   //       setUser(null);
//   //     }
//   //   });

//   //   return unsubscribe; // Cleanup subscription on unmount
//   // }, []);

//   const login = async () => {
//     const auth = FIREBASE_AUTH;

//     signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         setUser(userCredential.user);
//       })
//       .catch((error) => {
//         console.error("Error signing in: ", error.message);
//       });

//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUser(user); // Set the user when authenticated
//       }
//     });

//     //if login successful, make alert
//     if (user) {
//       Alert.alert("Login Successful");
//     } else {
//       Alert.alert("Login Failed");
//     }
//     return unsubscribe; // Cleanup subscription on unmount
//   };

//   const logout = async () => {
//     const auth = getAuth();
//     auth.signOut();
//     setUser(null);
//   };

//   const handleSendData = async () => {
//     if (!user) {
//       alert("User not authenticated");
//       return;
//     }

//     try {
//       const docRef = doc(FIRESTORE_DB, "BinData", "uniqueDocId"); // Use a unique ID or some identifier for your document
//       await setDoc(
//         docRef,
//         {
//           fillLevel: dustbinFillLevel,
//           location: dustbinLocation,
//           timestamp: serverTimestamp(),
//         },
//         { merge: true }
//       ); // Use merge to update the document without overwriting the existing data

//       alert("Data sent successfully!");
//     } catch (error) {
//       console.error("Error sending data: ", error.message);
//       alert("Failed to send data: " + error.message);
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const granted = await checkPermissionStatus();
//       setPermissionGranted(granted);
//       if (granted) {
//         startPolling();
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     return () => {
//       stopPolling();
//     };
//   }, []);

//   const checkPermissionStatus = async () => {
//     try {
//       return await PermissionsAndroid.check(
//         PermissionsAndroid.PERMISSIONS.READ_SMS
//       );
//     } catch (err) {
//       console.warn("Error checking SMS permission:", err);
//       return false;
//     }
//   };

//   const requestSmsPermission = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.READ_SMS,
//         {
//           title: "SMS Permission",
//           message: "This app needs access to your SMS messages",
//           buttonNeutral: "Ask Me Later",
//           buttonNegative: "Cancel",
//           buttonPositive: "OK",
//         }
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } catch (err) {
//       console.warn("Error requesting SMS permission:", err);
//       return false;
//     }
//   };

//   const readSms = async () => {
//     if (!permissionGranted) {
//       const granted = await requestSmsPermission();
//       if (!granted) {
//         Alert.alert(
//           "Permission Denied",
//           "Cannot read SMS messages without permission"
//         );
//         return;
//       }
//       setPermissionGranted(granted);
//     }

//     const filter = {
//       box: "inbox",
//       address: phoneNumber,
//       minDate: lastTimestamp,
//       indexFrom: 0,
//       maxCount: 1, // Only fetch the latest message
//     };

//     SmsAndroid.list(
//       JSON.stringify(filter),
//       (fail) => {
//         console.log("Failed with this error: " + fail);
//         Alert.alert("Error", "Failed to read SMS: " + fail);
//       },
//       (count, smsList) => {
//         const newMessages = JSON.parse(smsList);
//         if (newMessages.length > 0) {
//           const latestMessage = newMessages[0];
//           const messageBody = latestMessage.body;
//           const fillLevelMatch = messageBody.match(
//             /Dustbin Fill Level: (\d+%)/
//           );
//           const locationMatch = messageBody.match(
//             /Dustbin Location: (http:\/\/maps\.google\.com\/maps\?q=[\d.,]+)/
//           );

//           if (fillLevelMatch) {
//             setDustbinFillLevel(fillLevelMatch[1]);
//           }
//           if (locationMatch) {
//             setDustbinLocation(locationMatch[1]);
//           }
//           setLastTimestamp(latestMessage.date);
//           handleSendData();
//           console.log("Latest Message Body:", messageBody);
//         }
//       }
//     );
//   };

//   const startPolling = () => {
//     readSms(); // Initial read
//     pollingInterval = setInterval(readSms, 1000); // Poll every 10 seconds
//   };

//   const stopPolling = () => {
//     if (pollingInterval) {
//       clearInterval(pollingInterval);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.innerContainer}>
//         <TextInput
//           style={styles.input}
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChangeText={(text) => setEmail(text)}
//         />
//         <TextInput
//           style={styles.input}
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChangeText={(text) => setPassword(text)}
//         />
//         <TouchableOpacity style={styles.button} onPress={login}>
//           <Text style={styles.buttonText}>Login</Text>
//         </TouchableOpacity>
//       </View>
//       <TouchableOpacity style={styles.button} onPress={logout}>
//         <Text style={styles.buttonText}>Logout</Text>
//       </TouchableOpacity>
//       {permissionGranted ? (
//         dustbinFillLevel && dustbinLocation ? (
//           <>
//             <Text style={styles.smsText}>Fill Level: {dustbinFillLevel}</Text>
//             <Text style={styles.smsText}>Location: {dustbinLocation}</Text>
//           </>
//         ) : (
//           <Text>No messages yet.</Text>
//         )
//       ) : (
//         <Text>Permission not granted to read SMS.</Text>
//       )}
//     </SafeAreaView>
//   );
// };

// let pollingInterval;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   innerContainer: {
//     padding: 16,
//   },
//   smsText: {
//     marginVertical: 8,
//   },
//   // container2: {
//   //   flex: 1,
//   //   justifyContent: "center",
//   //   alignItems: "center",
//   //   padding: 20,
//   //   backgroundColor: "#f5f5f5",
//   // },
//   input: {
//     width: "100%",
//     height: 40,
//     borderColor: "#ddd",
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   button: {
//     width: "100%",
//     height: 45,
//     backgroundColor: "#007BFF",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// export default App;
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  PermissionsAndroid,
  Alert,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import SmsAndroid from "react-native-get-sms-android";
import { FIREBASE_AUTH, FIRESTORE_DB } from "./FirebaseConfig";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { set } from "firebase/database";

const App = () => {
  const [dustbinFillLevel, setDustbinFillLevel] = useState(null);
  const [dustbinLocation, setDustbinLocation] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState(Date.now());
  const [user, setUser] = useState(null);
  const phoneNumber = "+923400853168";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const auth = FIREBASE_AUTH;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const login = async () => {
    const auth = FIREBASE_AUTH;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      Alert.alert("Login Successful");
    } catch (error) {
      console.error("Error signing in: ", error.message);
      Alert.alert("Login Failed", error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      setUser(null);
      Alert.alert("Logout Successful");
    } catch (error) {
      console.error("Error signing out: ", error.message);
      Alert.alert("Logout Failed", error.message);
    }
  };

  const handleSendData = async (level, loc) => {
    try {
      const docRef = doc(FIRESTORE_DB, "BinData", "uniqueDocId");
      await setDoc(
        docRef,
        {
          fillLevel: level,
          location: loc,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );
      alert("Data sent successfully!");
    } catch (error) {
      console.error("Error sending data: ", error.message);
      alert("Failed to send data: " + error.message);
    }
  };

  useEffect(() => {
    (async () => {
      const granted = await checkPermissionStatus();
      setPermissionGranted(granted);
      if (granted) {
        startPolling();
      }
    })();
  }, []);


  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const checkPermissionStatus = async () => {
    try {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );
    } catch (err) {
      console.warn("Error checking SMS permission:", err);
      return false;
    }
  };

  const requestSmsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "SMS Permission",
          message: "This app needs access to your SMS messages",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn("Error requesting SMS permission:", err);
      return false;
    }
  };

  const readSms = async () => {
    if (!permissionGranted) {
      const granted = await requestSmsPermission();
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Cannot read SMS messages without permission"
        );
        return;
      }
      setPermissionGranted(granted);
    }

    const filter = {
      box: "inbox",
      address: phoneNumber,
      minDate: lastTimestamp,
      indexFrom: 0,
      maxCount: 1,
    };

    console.log("Reading SMS with filter:", filter);

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.log("Failed with this error: " + fail);
        Alert.alert("Error", "Failed to read SMS: " + fail);
      },
      (count, smsList) => {
        console.log("SMS List:", smsList);
        if (smsList) {
          const newMessages = JSON.parse(smsList);
          console.log("New messages:", newMessages);
          if (newMessages.length > 0) {
            const latestMessage = newMessages[0];
            const messageBody = latestMessage.body;
            console.log("Latest Message Body:", messageBody);

            const fillLevelMatch = messageBody.match(
              /Dustbin Fill Level: (\d+(\.\d+)?%)/
            );
            const locationMatch = messageBody.match(
              /Dustbin Location: (http:\/\/maps\.google\.com\/maps\?q=[\d.,]+)/
            );

            if (fillLevelMatch) {
              setDustbinFillLevel(fillLevelMatch[1]);
            } else {
              console.log("No fill level match found.");
            }
            if (locationMatch) {
              setDustbinLocation(locationMatch[1]);
            } else {
              console.log("No location match found.");
            }
            setLastTimestamp(latestMessage.date);

            // Log the latest message body and state values after state updates
            let level = null
            let loc = null

            setDustbinFillLevel((prevFillLevel) => {
              console.log("Fill Level: ", prevFillLevel);
              level =  prevFillLevel;
              return fillLevelMatch ? fillLevelMatch[1] : prevFillLevel;
            });
            setDustbinLocation((prevLocation) => {
              console.log("Location: ", prevLocation);
              loc = prevLocation;
              return locationMatch ? locationMatch[1] : prevLocation;
            });
            handleSendData(level, loc);
          }
        }
      }
    );
  };

  const startPolling = () => {
    readSms();
    pollingInterval = setInterval(readSms, 3000);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {permissionGranted ? (
        dustbinFillLevel && dustbinLocation ? (
          <>
            <Text style={styles.smsText}>Fill Level: {dustbinFillLevel}</Text>
            <Text style={styles.smsText}>Location: {dustbinLocation}</Text>
          </>
        ) : (
          <Text>No messages yet.</Text>
        )
      ) : (
        <Text>Permission not granted to read SMS.</Text>
      )}
    </SafeAreaView>
  );
};

let pollingInterval;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  innerContainer: {
    padding: 16,
  },
  smsText: {
    marginVertical: 8,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    height: 45,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default App;
