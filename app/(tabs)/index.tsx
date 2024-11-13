import React, { Component } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface Achievement {
  id: number; 
  title: string;
  description: string;
  threshold: number;
  achieved: boolean;
}

interface AchievementsState {
  achievements: Achievement[];
  isNewUser: boolean;
  dialogStep: number;
  showModal: boolean;
}

export default class AchievementsPage extends Component<{}, AchievementsState> {
  intervalId: NodeJS.Timeout | null = null;
  dialogSteps: string[] = [
    'Мама: Привіт, любий! Я бачу, що ти тільки починаєш свої пригоди з сервірування.',
    'Мама: Пам\'ятай, що гості люблять гарно поданий стіл!',
    'Мама: Покажи свою майстерність і отримай найкращі досягнення!',
    'Мама: Ну що, ти готовий? Давай вперед, я вірю в тебе!'
  ];

  constructor(props: {}) {
    super(props);
    this.state = {
      achievements: [
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
      ],
      isNewUser: true,
      dialogStep: 0,
      showModal: false,
    };
  }

  componentDidMount() {
    this.checkNewUser();
    //AsyncStorage.clear()      //clear storage if you want
    this.intervalId = setInterval(() => {
      this.loadAchievements();
    }, 10000);
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  checkNewUser = async () => {
    try {
      const isNewUser = await AsyncStorage.getItem('isNewUser');
      if (!isNewUser) {
        await AsyncStorage.setItem('isNewUser', 'false');
        this.setState({ isNewUser: true, showModal: true });
      } else {
        this.setState({ isNewUser: false });
      }
    } catch (error) {
      console.error('Помилка перевірки нового користувача:', error);
    }
  };

  loadAchievements = async () => {
    try {
      const storedAchievements = await AsyncStorage.getItem('achievements');
      if (storedAchievements) {
        const parsedAchievements = JSON.parse(storedAchievements);
        this.setState({ achievements: parsedAchievements });
      }
    } catch (error) {
      console.error('Помилка завантаження досягнень:', error);
    }
  };

  handleNextDialogStep = () => {
    if (this.state.dialogStep < this.dialogSteps.length - 1) {
      this.setState(prevState => ({
        dialogStep: prevState.dialogStep + 1
      }));
    } else {
      this.setState({ showModal: false });
      router.replace('/explore');
    }
  };

  renderAchievements() {
    return this.state.achievements.map(achievement => (
      <View
        key={achievement.id}
        style={[
          styles.achievementContainer,
          achievement.achieved ? styles.achieved : styles.notAchieved,
        ]}
      >
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
        <Text style={styles.achievementStatus}>
          {achievement.achieved ? 'Досягнуто' : `Поріг: ${achievement.threshold}`}
        </Text>
      </View>
    ));
  }

  render() {
    return (
      <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Modal
          visible={this.state.showModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <ImageBackground
              source={require('../../assets/images/mother.png')}
              style={styles.modalBackground}
            >
              <View style={styles.dialogBox}>
                <Text style={styles.dialogText}>{this.dialogSteps[this.state.dialogStep]}</Text>
                <TouchableOpacity onPress={this.handleNextDialogStep}>
                  <Text style={styles.nextButton}>Далі</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </Modal>
        <Text style={styles.pageTitle}>Ваші досягнення</Text>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {this.renderAchievements()}
        </ScrollView>
      </SafeAreaView>
      </SafeAreaProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5D4037',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollViewContent: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
  },
  dialogText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  nextButton: {
    textAlign: 'center',
    color: '#007BFF',
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  achievementContainer: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  achieved: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  notAchieved: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  achievementStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
