import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { useConnection } from "../providers/ConnectionProvider";

function Dot({status}:{status:"online"|"stale"|"offline"}) {
  const bg = status==="online" ? "#22c55e" : status==="stale" ? "#f59e0b" : "#ef4444";
  return <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: bg, marginRight: 6 }} />;
}

function Pill({label, base, status, age, latency}:{label:string;base?:string;status:any;age?:number;latency?:number}) {
  const txt = age==null ? "—" : `${Math.floor(age/1000)}s`;
  const host = base ? base.replace(/^https?:\/\//,'') : "";
  const lat = latency!=null ? ` • ${latency}ms` : "";
  return (
    <View style={{
      flexDirection:"row", alignItems:"center",
      backgroundColor:"#111827", borderColor:"#1f2937", borderWidth:1,
      paddingVertical:4, paddingHorizontal:8, borderRadius:12, marginBottom:6, marginRight:8
    }}>
      <Dot status={status} />
      <Text style={{ color:"#e5e7eb", fontSize:12, fontWeight:"600" }}>{label}</Text>
      <Text style={{ color:"#9ca3af", fontSize:11 }}>  {host}</Text>
      <Text style={{ color:"#9ca3af", fontSize:11 }}>  • {txt}{lat}</Text>
    </View>
  );
}

export default function ConnectionFooter() {
  const { car, start, finish, refreshOnce } = useConnection();
  const now = Date.now();
  const { width } = useWindowDimensions();
  const narrow = width < 420;
  const age = (u:any) => u.lastOk ? now - u.lastOk : undefined;

  const stackStyle = narrow
    ? { flexDirection:"column" as const, alignItems:"center" as const }
    : { flexDirection:"row" as const, justifyContent:"center" as const, alignItems:"center" as const };

  return (
    <View style={{
      position:"absolute", left:0, right:0, bottom:0,
      paddingHorizontal:10, paddingVertical:8, backgroundColor:"rgba(0,0,0,0.4)",
    }}>
      <View style={stackStyle}>
        <Pill label="Car"    base={car.base}    status={car.status}    age={age(car)}    latency={car.latencyMs} />
        <Pill label="Start"  base={start.base}  status={start.status}  age={age(start)}  latency={start.latencyMs} />
        <Pill label="Finish" base={finish.base} status={finish.status} age={age(finish)} latency={finish.latencyMs} />
        <TouchableOpacity onPress={refreshOnce} style={{ marginLeft: narrow ? 0 : 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937" }}>
          <Text style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 12 }}>↻</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
