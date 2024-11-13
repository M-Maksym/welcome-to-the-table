import { StyleSheet, Text, LayoutChangeEvent, Modal, TouchableOpacity, ImageBackground, Vibration } from 'react-native';

import React, {useState, useRef, useEffect} from 'react';
import { View } from 'react-native';
import Draggable from 'react-native-draggable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dish from '@/components/dish/Dish';
import CountDown from 'react-native-countdown-component';


interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

const imageSources = [
  require('../../assets/images/dish1.png'),
  require('../../assets/images/dish2.png'),
  require('../../assets/images/dish3.png'),
  require('../../assets/images/dish4.png'),
  require('../../assets/images/dish5.png'),
  require('../../assets/images/dish6.png'),
  require('../../assets/images/dish7.png'),
  require('../../assets/images/dish8.png'),
  require('../../assets/images/dish9.png'),
  require('../../assets/images/dish10.png'),
  require('../../assets/images/dish11.png'),
  require('../../assets/images/dish12.png'),
];

export default function TabTwoScreen() {
  const initialDishesCount = 2;
  const initialTime = 30; 

  const draggableRefs = useRef<(View | null)[]>([]);        //info about dishes position

  const [positionTable, setPositionTable] = useState<Position>({ x: 0, y: 0, width: 0, height: 0 });
  const [positionDishes, setPositionDishes] = useState<Position[]>([]);
  const [dishesCount, setDishesCount] = useState(2);  // general number of dishes
  const [onTable, setOnTable] = useState<boolean[]>(Array(initialDishesCount).fill(false)); //number of dishes on table
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTimeOver, setIsTimeOver] = useState(false);      //time is over
  const [modalVisible, setModalVisible] = useState(false);  //modal message about overlapping
  const [record, setRecord] = useState<number>(0);          //personal record
  const [countdownId, setCountdownId] = useState('1'); 
  const [running, setRunning] = useState(true); 
  // useEffect(() => {
  //   if (timeLeft > 0) {
  //     const timer = setTimeout(() => {
  //       setTimeLeft(timeLeft - 5);
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   } else {
  //     setIsTimeOver(true);
  //     handleEndGame();
  //   }
  // }, [timeLeft]);
  useEffect(() => {
    getRecord();
  }, []);
    //checking if all dishes on the table
  useEffect(() => {
    positionDishes.forEach((dish, index) => {
      const result = isDishOnTable(positionTable, dish);
      updateArrayAtIndex(index, result);
    });
    if (onTable.every(status => status)) {
      setDishesCount(prevCount => {
        const newCount = prevCount + 1;
        setOnTable([...onTable, false]);
        checkAchievements(prevCount);
        return newCount;
      });
    }
  }, [positionTable, positionDishes]);

  const isDishOnTable = (table: Position, dish: Position): boolean => {
    const isWithinX = dish.x >= table.x && (dish.x + dish.width) <= (table.x + table.width);
    const isWithinY = dish.y >= table.y && (dish.y + dish.height) <= (table.y + table.height);
    return isWithinX && isWithinY;
  };

  const updateArrayAtIndex = (index: number, newValue: boolean) => {
    setOnTable(prevState => {
      const newState = [...prevState];
      newState[index] = newValue;
      return newState;
    });
  };

  const isOverlapping = (dish1: Position, dish2: Position): boolean => {
    return (
      dish1.x < dish2.x + dish2.width &&
      dish1.x + dish1.width > dish2.x &&
      dish1.y < dish2.y + dish2.height &&
      dish1.y + dish1.height > dish2.y
    );
  };
  const isDishOverlapping = (newDish: Position, index: number): boolean => {
    return positionDishes.some((dish, i) => i !== index && isOverlapping(dish, newDish));
  };

  const handleDragRelease = (index: number) => {
    if (draggableRefs.current[index]) {
      draggableRefs.current[index]?.measure((fx, fy, width, height, px, py) => {
        const newDishPosition = { x: px, y: py, width, height };

        
        if (!isDishOverlapping(newDishPosition, index)) {
          setPositionDishes(prevState => {
            const newState = [...prevState];
            newState[index] = newDishPosition;
            return newState;
          });
        } else {
          Vibration.vibrate(1 * 1000);
          setModalVisible(true);
        }
      });
    }
  };

  //info about table
  const handleLayout = (event: LayoutChangeEvent) => {
    let { x, y, width, height } = event.nativeEvent.layout;
    x -= 15;
    y -= 15;
    width += 30;
    height += 30;
    setPositionTable({ x, y, width, height });
  };

  const handleRestartGame = () => {
    setModalVisible(false);
    setIsTimeOver(false);
    setOnTable(Array(initialDishesCount).fill(false));
    setPositionDishes([]);
    setDishesCount(initialDishesCount);
    setTimeLeft(initialTime);
    setCountdownId(Math.floor(Math.random() * 101).toString());
  };
  
  const getRecord = async () => {
    try {
      const storedRecord = await AsyncStorage.getItem('userRecord');
      if (storedRecord !== null) {
        setRecord(parseInt(storedRecord, 10));
      }
    } catch (error) {
      console.error('Помилка отримання рекорду:', error);
    }
  };
  const handleEndGame = async () => {
    Vibration.vibrate(2 * 1000);
    const currentScore = onTable.filter(Boolean).length;
    if (currentScore > record) {
      setRecord(currentScore);
      await saveRecord(currentScore);
    }
  };
  const saveRecord = async (newRecord: number) => {
    try {
      await AsyncStorage.setItem('userRecord', newRecord.toString());
    } catch (error) {
      console.error('Помилка збереження рекорду:', error);
    }
  }
  const checkAchievements = async (dishesPlaced: number) => {
    try {
      const storedAchievements = await AsyncStorage.getItem('achievements');
      let achievements = [];
  
      if (storedAchievements) {
        achievements = JSON.parse(storedAchievements);
      } else {
        achievements = [
          { id: 0, title: 'Гостинний', description: 'Розставте 0 страв на столі. Покажіть на скільки ви раді гостям.', threshold: 0, achieved: false },
          { id: 5, title: 'Сміливець-початківець', description: 'Розставте 5 страв на столі без падінь. Схоже, ви точно вмієте тримати баланс!', threshold: 5, achieved: false },
          { id: 10, title: 'Гурман-початківець', description: 'Розставте 10 страв і не зʼїжте жодну під час цього. Ваша витримка вражає!', threshold: 10, achieved: false },
          { id: 20, title: 'Супер-декоратор', description: '20 страв на столі! Ваші рідні будуть в захваті.', threshold: 20, achieved: false },
          { id: 30, title: 'Невтомний сервірувальник', description: 'Розставте 30 страв і отримаєте звання "Сервірувальника року".', threshold: 30, achieved: false },
          { id: 40, title: 'Кулінарний архітектор', description: '40 страв на столі. Вони повинні почати будувати піраміду!', threshold: 40, achieved: false },
          { id: 50, title: 'Бенкет для королів', description: 'Розставте 50 страв і відчуйте себе справжнім кухарем у королівському палаці.', threshold: 50, achieved: false },
          { id: 75, title: 'Легендарний сервірувальник', description: '75 страв! Хто-небудь зупиніть цього шефа!', threshold: 75, achieved: false },
          { id: 100, title: 'Столовий герой', description: '100 страв на столі. Це не сервірування — це справжній подвиг!', threshold: 100, achieved: false },
          { id: 150, title: 'Серверувальний феномен', description: '150 страв! Ви офіційно перевершили самих себе.', threshold: 150, achieved: false },
          { id: 200, title: 'Бог столових справ', description: '200 страв. Тепер столові прилади падають вам до ніг.', threshold: 200, achieved: false },
          ];
      }
      const updatedAchievements = achievements.map((achievement:any) => {
        if (dishesPlaced >= achievement.threshold && !achievement.achieved) {
          achievement.achieved = true;
        }
        return achievement;
      });
      await AsyncStorage.setItem('achievements', JSON.stringify(updatedAchievements));
      
      return updatedAchievements;
    } catch (error) {
      console.error('Помилка роботи з досягненнями:', error);
      return [];
    }
  };
  const tableWidth = 300;
  const tableHeight = 500;

  return (
    <ImageBackground
    source={require('../../assets/images/carpet.jpg')}
    style={styles.container}>
      <TouchableOpacity onPress={()=>setRunning(false)} style={styles.pause}>
      <ImageBackground 
      source={require('../../assets/images/pause.png')}
      style={styles.pause__ico}>
        
      </ImageBackground>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>handleRestartGame()} style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
        <Text style={styles.timerText}>Час</Text>
        <CountDown
        until={timeLeft}
        id={countdownId}
        onFinish={() => {
          setIsTimeOver(true);
          handleEndGame();
        }
        }
        running={running}
        onPress={()=>handleRestartGame()}
        size={20}
        digitStyle={{backgroundColor: 'transparent', margin:0, padding:0}}
        digitTxtStyle={{color: '#FFD943', lineHeight:60}}
        timeToShow={['S']}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={!running}
        onRequestClose={() => setRunning(true)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Продовжити?</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setRunning(true)}>
              <Text style={styles.closeButtonText}>Так</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Text style={styles.timerText}>сек.</Text>
      </TouchableOpacity>
      
      <Text style={styles.recordText}>{`Ваш рекорд: ${record} страв`}</Text>
      <View
        onLayout={handleLayout}
        style={{ width: tableWidth, height: tableHeight,borderRadius: 15 }}
      >
        <ImageBackground 
          source={require('../../assets/images/table.jpg')} 
          style={{ width: tableWidth, height: tableHeight,borderRadius: 15 }} 
          imageStyle={{ borderRadius: 15 }}
        >
        </ImageBackground>
      </View>
      {onTable.map((isOnTable, index) => (
        !isOnTable&&<Text key={index} 
                          style={styles.result}>
                            {`Страва ${index + 1} ${isOnTable ? 'на столі' : 'не на столі'}`}
                    </Text>
      ))}
      
      {Array.from({ length: dishesCount }).map((_, index: number) => (
        <Draggable
          key={index}
          x={100}
          y={positionTable.y+positionTable.height}
          onDragRelease={() => handleDragRelease(index)}
          disabled={isTimeOver}
        >
          <View style={styles.box} ref={el => draggableRefs.current[index] = el}>
          <Dish imageSources={imageSources} />
          </View>
        </Draggable>
      ))}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Накладання! Цю страву не можна накласти на іншу. Спробуйте інше місце.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isTimeOver}
        onRequestClose={() => handleRestartGame}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Час вийшов! Ви розташували {onTable.filter(Boolean).length} страв.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleRestartGame}>
              <Text style={styles.closeButtonText}>Розпочати нову гру</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timerText: {
    fontSize: 20,
    color: "#FFD943",
    marginBottom: 10,
    fontWeight:'900'
  },
  recordText: {
    fontSize: 18,
    color: "#FFD943",
    marginBottom: 10,
    fontWeight:'700'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 50,
    height: 50,
    backgroundColor: 'transparent',
  },
  box1: {
    width: 100,
    height: 100,
    backgroundColor: 'pink',
  },
  result:{
    fontSize:25,
    color:"#FFD943"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#8E4518',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  pause:{
    width:50,
    height:50, 
    backgroundColor:'#FFD943',
    borderRadius:15,
    position:"absolute",
    top:50,
    right:20
  },
  pause__ico:{
    width:50,
    height:50, 
  },
});
