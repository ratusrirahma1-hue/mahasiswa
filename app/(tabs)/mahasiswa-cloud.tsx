import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function MahasiswaCloudScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null); // State untuk melacak data yang diedit
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [prodi, setProdi] = useState('');
  const [kelas, setKelas] = useState('');

  const loadData = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('mahasiswa')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) Alert.alert('Error', error.message);
    else setRows(data || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // Handler untuk membuka modal (bisa untuk Tambah atau Edit)
  const openModal = (data?: any) => {
    if (data) {
      setEditingId(data.id);
      setNim(data.nim);
      setNama(data.nama);
      setProdi(data.prodi);
      setKelas(data.kelas || '');
    } else {
      setEditingId(null);
      setNim('');
      setNama('');
      setProdi('');
      setKelas('');
    }
    setModalVisible(true);
  };

  const simpanData = async () => {
    if (!nim || !nama || !prodi) {
      Alert.alert('Peringatan', 'Lengkapi data wajib!');
      return;
    }

    const payload = { nim, nama, prodi, kelas: kelas || null };

    if (editingId) {
      // LOGIKA EDIT (UPDATE)
      const { error } = await supabase.from('mahasiswa').update(payload).eq('id', editingId);
      if (error) Alert.alert('Gagal Update', error.message);
      else Alert.alert('Sukses', 'Data berhasil diperbarui');
    } else {
      // LOGIKA TAMBAH (INSERT)
      const { error } = await supabase.from('mahasiswa').insert([payload]);
      if (error) Alert.alert('Gagal Simpan', error.message);
      else Alert.alert('Sukses', 'Data berhasil ditambahkan');
    }

    setModalVisible(false);
    loadData();
  };

  const hapusData = (id: string) => {
    Alert.alert('Konfirmasi Hapus', 'Yakin ingin menghapus data ini?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Hapus', 
        style: 'destructive', 
        onPress: async () => {
          await supabase.from('mahasiswa').delete().eq('id', id);
          loadData();
        } 
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mahasiswa</Text>
          <Text style={styles.headerSubtitle}>{rows.length} Mahasiswa Terdaftar</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} />}
      >
        {loading && !refreshing ? <ActivityIndicator size="large" color="#0a7ea4" style={{marginTop: 50}} /> : null}
        
        {rows.map((m) => (
          <View key={m.id} style={styles.card}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{m.nama ? m.nama.charAt(0).toUpperCase() : '?'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardNama}>{m.nama}</Text>
              <Text style={styles.cardNim}>{m.nim} • {m.prodi}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <Pressable style={styles.btnIconEdit} onPress={() => openModal(m)}>
                <Text style={styles.btnTextEdit}>Edit</Text>
              </Pressable>
              <Pressable style={styles.btnIconHapus} onPress={() => hapusData(m.id)}>
                <Text style={styles.btnTextHapus}>Hapus</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => openModal()}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* MODAL EDIT/TAMBAH */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContentCenter}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Data' : 'Tambah Data'}</Text>
            
            <TextInput placeholder="NIM" value={nim} onChangeText={setNim} style={styles.input} placeholderTextColor="#999" />
            <TextInput placeholder="Nama Lengkap" value={nama} onChangeText={setNama} style={styles.input} placeholderTextColor="#999" />
            <TextInput placeholder="Program Studi" value={prodi} onChangeText={setProdi} style={styles.input} placeholderTextColor="#999" />
            <TextInput placeholder="Kelas" value={kelas} onChangeText={setKelas} style={styles.input} placeholderTextColor="#999" />

            <View style={styles.modalButtons}>
              <Pressable style={[styles.btnAction, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </Pressable>
              <Pressable style={[styles.btnAction, styles.btnSimpan]} onPress={simpanData}>
                <Text style={styles.btnSimpanText}>{editingId ? 'Perbarui' : 'Simpan'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1A1A1A' },
  headerSubtitle: { color: '#666', fontSize: 13 },
  
  listContainer: { padding: 16, paddingBottom: 100 },
  card: { 
    backgroundColor: '#FFF', padding: 12, borderRadius: 16, marginBottom: 12, 
    flexDirection: 'row', alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3
  },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#0a7ea4', fontWeight: 'bold' },
  cardNama: { fontSize: 16, fontWeight: '700' },
  cardNim: { color: '#636E72', fontSize: 12 },

  actionButtons: { flexDirection: 'row', gap: 8 },
  btnIconEdit: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#E3F2FD' },
  btnTextEdit: { color: '#0a7ea4', fontSize: 11, fontWeight: '700' },
  btnIconHapus: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#FFF5F5' },
  btnTextHapus: { color: '#FF5252', fontSize: 11, fontWeight: '700' },

  fab: {
    position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#0a7ea4', justifyContent: 'center', alignItems: 'center', elevation: 5,
    shadowColor: '#0a7ea4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6
  },
  fabIcon: { color: '#FFF', fontSize: 30, fontWeight: '300' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContentCenter: { width: '85%', backgroundColor: '#FFF', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#F5F7FA', padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 15, borderWidth: 1, borderColor: '#E1E4E8' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 5 },
  btnAction: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnCancel: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD' },
  btnSimpan: { backgroundColor: '#0a7ea4' },
  btnCancelText: { color: '#666', fontWeight: '600' },
  btnSimpanText: { color: '#FFF', fontWeight: '600' },
});